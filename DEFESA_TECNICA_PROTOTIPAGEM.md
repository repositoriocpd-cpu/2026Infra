# MEMORANDO TÉCNICO: JUSTIFICATIVA DE PROTOTIPAGEM E CONFORMIDADE
**PARA**: Subsecretaria de Tecnologia da Informação (STI) / Comitê de Governança de TI
**DE**: Departamento de TI - Secretaria Municipal de Educação de Itaguaí
**ASSUNTO**: Justificativa para uso de ambiente de homologação externo (GitHub/Supabase/Netlify)
**DATA**: 09 de Abril de 2026

---

## 1. OBJETIVO
Este documento visa formalizar a natureza técnica do ambiente atual do sistema **SUB INFRA**, justificando o uso temporário de ferramentas de nuvem externa para fins exclusivos de desenvolvimento, testes de interface (UI/UX) e validação de regras de negócio, em conformidade com as diretrizes de inovação e segurança.

## 2. FERRAMENTAS UTILIZADAS E JUSTIFICATIVA TÉCNICA
Para garantir a agilidade no ciclo de desenvolvimento (Agile Development) e a entrega rápida de valor à Secretaria de Educação, foram adotadas as seguintes ferramentas:

| Ferramenta | Finalidade | Justificativa |
| :--- | :--- | :--- |
| **GitHub** | Versionamento | Garantia de integridade do código fonte e rastreabilidade de alterações. |
| **Supabase** | Backend/Auth | Prototipagem rápida de banco de dados e validação de autenticação via e-mail institucional. |
| **Netlify** | Hospedagem | Disponibilização de ambiente de homologação acessível para feedback imediato dos gestores. |

## 3. CONFORMIDADE COM O DECRETO MUNICIPAL Nº 4.706/2022
Reconhecemos a obrigatoriedade de hospedagem final em servidores municipais. A infraestrutura atual é classificada estritamente como **Ambiente de Sandbox (Caixa de Areia)**:

1. **Inexistência de Dados Reais**: Todos os dados de processos (nomes, valores, fornecedores) inseridos no ambiente externo são **sintéticos (fictícios)**, gerados para testes de carga e layout.
2. **Caráter Não-Crítico**: O sistema não está sendo utilizado para decisões administrativas oficiais nesta fase.
3. **Versão de Teste**: Todas as telas exibem o rótulo "VERSÃO TESTE", alertando usuários sobre a natureza do ambiente.

## 4. CONFORMIDADE COM A LGPD (LEI 13.709/2018)
Para mitigar riscos de privacidade no setor público:
- **Minimização**: Apenas e-mails institucionais são utilizados para autenticação, sem coleta de dados sensíveis de cidadãos.
- **Segurança Implementada**: Foram aplicadas políticas de **Row-Level Security (RLS)** no banco de dados para garantir que, mesmo em fase de teste, o acesso seja restrito aos perfis autorizados.
- **Isolamento**: O banco de dados de teste é isolado de quaisquer outros sistemas legados da prefeitura.

## 5. PLANO DE MIGRACÃO E SOBERANIA DIGITAL
O projeto foi estruturado utilizando tecnologias que permitem a **portabilidade total**:
- **Banco de Dados**: PostgreSQL (padrão Supabase), compatível com servidores municipais.
- **Frontend**: Vanilla JavaScript/HTML, sem dependências de infraestrutura de nuvem proprietária.
- **Próximos Passos**: Assim que o cronograma de homologação for concluído, será solicitada a conteinerização (Docker) para deploy no datacenter da Prefeitura de Itaguaí.

## 6. CONCLUSÃO
O uso das ferramentas descritas não constitui uma tentativa de contornar os decretos municipais, mas sim uma **estratégia técnica de aceleração** para garantir que o sistema final, ao ser instalado nos servidores locais, já esteja maduro e livre de erros críticos.

---
**Responsável Técnico**
Área de TI - Secretaria de Educação
Prefeitura Municipal de Itaguaí
