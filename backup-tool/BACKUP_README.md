# Manual de Instalação e Produção: Backup Automatizado Supabase

O script autônomo e criptografado (`backup_supabase.py`) já foi redigido estruturalmente. Ele foi desenhado nativamente para rodar em servidores **Ubuntu/Debian Linux**.

Siga os passos abaixo, no terminal SSH da sua máquina servidora Linux, para ligar a turbina 24 horas por dia, a cada 3 horas ininterruptas.

## 1. Dependências do Sistema Operacional
Para que o código consiga buscar o Banco de Dados, se comunicar pela Web e trancar tudo com um cadeado virtual, rode isso no Ubuntu:

```bash
# Atualizações Gerais da Base de Pacotes
sudo apt update -y

# Instala a Ferramenta Clássica (que contém o utilitário `pg_dump` exigido pelo nosso script)
sudo apt install postgresql-client -y

# Instala o interpretador do Python 3 e o gerenciador de repositórios (Pip)
sudo apt install python3 python3-pip -y

# Instala o dotenv para chaves cegas e o 'cryptography' (para o nosso cadeado AES)
pip3 install python-dotenv cryptography
```

## 2. Preparação Arquitetural de Pastas
O `Python` vai querer despejar os backups em locais seguros fora do repositório da web. Crie as pastas master e dê permissão:

```bash
# Cria as pastas sistêmicas do seu HD para salvar o acervo do Supabase
sudo mkdir -p /opt/backups/supabase
sudo mkdir -p /opt/backups/logs

# Opcional: Garante que o `SEU USUÁRIO VIGENTE DO UBUNTU` possa gravar os dumps e gerar log dentro dela sem explodir Erro de Permissão Local
sudo chown -R $USER:$USER /opt/backups/
```

## 3. Parametrização Segura (Cadeado e E-mails)
Jogue/Mova a pasta `backup-tool/` inteirinha lá para dentro do seu Ubuntu na home (ex: `/home/ubuntu/backup-tool`).

Entre lá e copie o template do ambiente:
```bash
cd /home/ubuntu/backup-tool
cp .env.example .env

# Vamos editar e preencher os parâmetros!
nano .env
```
Preencha sua **Supabase URL**, seu **Email e a Senha de APP do Google Gmail**.

### 🗝️ Como gerar a tão famosa Chave AES?
No terminal, digite esse pequeno feitiço do Python:
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```
Vai retornar um supertexto aleatório. Dê Ctrl+C nele e *cole na última linha* (`AES_KEY=`) lá do arquivo `.env` para imortalizarmos a Tranca de Criptografia Simétrica nesse computador.

## 4. O Teste de Ignição (Dry Run)
Antes de colocarmos ele no modo robô silencioso de 3 Horas, teste você mesmo:

```bash
chmod +x backup_supabase.py
python3 backup_supabase.py
```
> O sistema rodará, aparecerá a engrenagem, falará que trancou com AES (criptografia implementada de fábrica como foi pedido) e você deve receber neste exato instante o e-mail formal na sua caixa `repositoriocpd@edu...` de Status! 

## 5. Escalando para Automação Robótica (Cron Job)
A magia principal que você pediu! Se o teste manual acusou sucesso e o e-mail brotou...

1. Abra a central de agendamento de tarefas do Linux:
```bash
crontab -e
```
*(Escolha `nano` para editar, caso o sistema Ubuntu te pergunte).*

2. Use a seta do teclado e pule para a primeiríssima linha vazia no final do arquivo. Escreva o Código Sagrado do *Time Frame* de 3 em 3 Horas:

```bash
# ==========================================================
# GESTÃO SUB INFRA | BACKUP RECORRENTE [ A CADA 3 HORAS ]
# ==========================================================
0 */3 * * * /usr/bin/python3 /home/ubuntu/backup-tool/backup_supabase.py
```
*(Se o seu bash do python ou a pasta não for `home/ubuntu`, altere o caminho para a sua localização final).* 

Aperte `Ctrl + O` (Salva), dê `Enter` e aperte `Ctrl + X` (Sair).
Você ouvirá do sistema um *crontab: installing new crontab*. A partir deste meio-dia em diante, de **3 em 3 horas**, ele puxará o banco de dados das nuvens e manterá a sua versão dos últimos **7 Dias** perfeita e intacta no Linux.
