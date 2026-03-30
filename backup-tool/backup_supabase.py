#!/usr/bin/env python3
import os
import time
import subprocess
import logging
import smtplib
from datetime import datetime
from email.message import EmailMessage
from dotenv import load_dotenv

# Dependência do AES Opcional (apenas se existir AES_KEY no .env, será importado)
try:
    from cryptography.fernet import Fernet
    AES_AVAILABLE = True
except ImportError:
    AES_AVAILABLE = False

# ==========================================
# CONFIGURAÇÕES E PASTAS
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKUP_DIR = '/opt/backups/supabase'
LOG_DIR = '/opt/backups/logs'

# Garante que os diretórios existam no Linux (precisa rodar como sudo init se não tiver permissão em /opt/)
os.makedirs(BACKUP_DIR, exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# Configura Logger robusto
log_file = os.path.join(LOG_DIR, 'backup.log')
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] - %(message)s'
)

# Carrega Variáveis (arquivo na mesma pasta do script principal)
load_dotenv(os.path.join(BASE_DIR, '.env'))

DB_URL = os.environ.get('SUPABASE_DB_URL')
EMAIL_USER = os.environ.get('EMAIL_USER')
EMAIL_PASS = os.environ.get('EMAIL_PASSWORD')
EMAIL_TO = os.environ.get('EMAIL_TO', 'repositoriocpd@edu.itaguai.rj.gov.br')
AES_KEY = os.environ.get('AES_KEY')


# ==========================================
# MÓDULOS DE ROTEAMENTO
# ==========================================

def send_alert_email(status, message, filepath=None, filesize_mb=0):
    """Módulo responsável pelo envio automático (SMTP) do Gmail"""
    if not EMAIL_USER or not EMAIL_PASS:
        logging.warning("Credenciais de e-mail não configuradas! Ignorando alerta SMTP.")
        return

    try:
        msg = EmailMessage()
        msg['Subject'] = f"Backup Supabase - STATUS: {status}"
        msg['From'] = f"Automação Infra <{EMAIL_USER}>"
        msg['To'] = EMAIL_TO

        content = f"SISTEMA DE AUDITORIA SUB INFRA\n==========================\n\n"
        content += f"Status do Relatório: {status}\n"
        content += f"Data/Hora do Acionamento da CRON: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
        content += f"\nDetalhes Técnicos do LOG:\n> {message}\n"
        
        if filesize_mb > 0:
            content += f"\nTamanho Final do Arquivo Processado: {filesize_mb:.2f} MB\n"
        
        msg.set_content(content)

        # Anexar arquivo se menor que 19MB (O Gmail e grande parte das provedoras aceita ~25MB no máximo)
        if filepath and os.path.exists(filepath) and filesize_mb < 19:
            with open(filepath, 'rb') as f:
                file_data = f.read()
                file_name = os.path.basename(filepath)
            msg.add_attachment(file_data, maintype='application', subtype='gzip', filename=file_name)
            logging.info(f"O tamanho ({filesize_mb:.2f}MB) está dentro do limite. O Dump será enviado anexado.")

        # Dispara via Gmail TLS/SSL
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(EMAIL_USER, EMAIL_PASS)
            smtp.send_message(msg)
            
        logging.info(f"E-mail institucional constando Status '{status}' enviado com sucesso para: {EMAIL_TO}.")
    except Exception as e:
        logging.error(f"FALHA GERAL no envio de E-mail de Status da Aplicação: {str(e)}")


def clear_old_backups(days_retention=7):
    """Deleta arquivos da pasta de histórico de backups com Timestamp maior que a retenção"""
    try:
        now = time.time()
        deleted = 0
        retention_seconds = days_retention * 86400  # 1 dia = 86400 s
        
        for filename in os.listdir(BACKUP_DIR):
            file_path = os.path.join(BACKUP_DIR, filename)
            if os.path.isfile(file_path):
                file_timestamp = os.stat(file_path).st_mtime
                if file_timestamp < (now - retention_seconds):
                    os.remove(file_path)
                    deleted += 1
                    
        if deleted > 0:
            logging.info(f"Limpeza de Retenção Concluída: {deleted} arquivos antigos (> {days_retention} dias) defenestrados do disco para otimização.")
    except Exception as e:
        logging.error(f"Erro ao passar o varredor de logs antigos: {str(e)}")


def encrypt_file(filepath):
    """Varre o arquivo e injeta AES Symmetric-Key no conteúdo inteiro se AES Key estiver inserida"""
    if not AES_KEY:
        logging.warning("Chave 'AES_KEY' vazia (ignorada). O backup continuará como gz raw desprotegido.")
        return filepath
    
    if not AES_AVAILABLE:
        logging.error("A biblioteca 'cryptography' de criptografia corporativa exigida não está instalada no Python nativo! Ignorei o processo de AES.")
        return filepath
        
    try:
        fernet = Fernet(AES_KEY.encode())
        with open(filepath, 'rb') as file:
            original_data = file.read()
            
        logging.info("Processando algoritmos AES sobre a imagem do banco...")
        encrypted_data = fernet.encrypt(original_data)
        
        enc_filepath = filepath + '.aes'
        with open(enc_filepath, 'wb') as enc_file:
            enc_file.write(encrypted_data)
            
        # Remove a versão original .gz (insegura) e mantém a .gz.aes
        os.remove(filepath)
        logging.info(f"A Criptografia foi consolidada. Aquivo trancado como AES-128-CBC -> {enc_filepath}")
        return enc_filepath
    except Exception as e:
        logging.error(f"Falha de Hash/Enc da Máquina durante compressão AES: {str(e)}")
        # Em caso de pane da lib do AES, salva o cru pra não perdermos dado do backup!
        return filepath


# ==========================================
# ROTINA PRINCIPAL (O Motor Puxador de Dump)
# ==========================================

def run_backup():
    logging.info("=====================================================================")
    logging.info(" INICIANDO A ROTINA DO SCRIPT [Backup Automático do Banco Supabase] ")
    logging.info("=====================================================================")
    
    if not DB_URL:
        msg = "FALHA GRAVE: String 'SUPABASE_DB_URL' não declarada no arquivo .env!"
        logging.error(msg)
        send_alert_email("ERRO FATAL", msg)
        return

    # Construção do nome exato que você especificou
    timestamp = datetime.now().strftime('%Y-%m-%d_%H-%M')
    backup_file = os.path.join(BACKUP_DIR, f"supabase_backup_{timestamp}.sql.gz")
    
    # Executa pd_dump piped to gzip invocando o Sistema Operacional!
    try:
        # Nota: -C envia COMANDOS CREATE TABLE, --clean destroi para recriar. --if-exists previne erros.
        dump_command = f"pg_dump '{DB_URL}' -C --clean --if-exists | gzip > {backup_file}"
        logging.info(f"O Sistema começou a extrair a tabela da Nuvem do Supabase...")
        
        # O Shell=True é obrigatório por causa da operação piped '| gzip' via SO Bash do Ubuntu.
        subprocess.run(dump_command, shell=True, check=True, executable='/bin/bash')
        logging.info(f"DUMP COM GZIP realizado com Sucesso e inserido no arquivo de cache.")
        
    except subprocess.CalledProcessError as e:
        msg = f"Infiltração de Comando ou Erro de Permissão do Pg_Dump local. Descrição do Bash de Saída: {str(e)}"
        logging.error(msg)
        send_alert_email("FALHA DE COMUNICAÇÃO (PG_DUMP)", msg)
        return
    except Exception as e:
        msg = f"Erro estrutural imprevisível operando subprocess call: {str(e)}"
        logging.error(msg)
        send_alert_email("ERRO DESCONHECIDO DO SCRIPT", msg)
        return

    # O arquivo `.sql.gz` está gerado corretamente na pasta local
    # Fase B: Criptografia AES de Segurança Corporativa (se ativada!)
    final_file = encrypt_file(backup_file)
    
    # Fase C: Avaliação Estrutural, Peso e Emailing do Robô de Gestão
    try:
        filesize_bytes = os.path.getsize(final_file)
        filesize_mb = filesize_bytes / (1024 * 1024)
        
        msg_success = f"Os arquivos consolidados do Processo Yasmin em nuvem foram gravados no Disco Físico sem problemas em:\n>> {final_file}."
        if AES_KEY and AES_AVAILABLE:
            msg_success += "\n>> (Tratado com Módulo Python 'FerNet' para AES)."
            
        send_alert_email("SUCESSO (Backup Finalizado)", msg_success, filepath=final_file, filesize_mb=filesize_mb)
        
    except Exception as e:
        logging.error(f"Pane no módulo FileSystem no momento de atestar o tamanho em bits do arquivo e gerar O E-mail: {str(e)}")

    # Fase final: Esgoto do Lixo Residencial para Poupar Storage/SSD 
    clear_old_backups(days_retention=7)
    
    logging.info(" ROTINA DO PYTHON DE BACKUP ENCERRADA POR ORDEM COM TOTAL ÊXITO. ")
    logging.info("=====================================================================\n\n")

if __name__ == '__main__':
    run_backup()
