import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidade — Ajuda Minha Cidade",
  description: "Política de Privacidade da plataforma Ajuda Minha Cidade.",
};

const LAST_UPDATED = "26 de fevereiro de 2025";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao mapa
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: {LAST_UPDATED}
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <Section title="1. Identificação dos Responsáveis">
            <p>
              A plataforma <strong>Ajuda Minha Cidade</strong> é desenvolvida e
              operada por <strong>Jorge Roberto Tomaz Junior</strong> e{" "}
              <strong>Thayrone de Souza Nascimento</strong>, pessoas físicas
              residentes no Brasil, doravante denominados conjuntamente como
              &quot;Operadores&quot; ou &quot;nós&quot;.
            </p>
            <p>
              Para fins da Lei Geral de Proteção de Dados (Lei nº 13.709/2018 —
              LGPD), os Operadores atuam como <strong>Controladores</strong> dos
              dados pessoais tratados nesta plataforma.
            </p>
            <p>Contatos dos responsáveis:</p>
            <ul>
              <li>
                Jorge Roberto Tomaz Junior:{" "}
                <a
                  href="mailto:jorgerobertodev@gmail.com"
                  className="underline"
                >
                  jorgerobertodev@gmail.com
                </a>
              </li>
              <li>
                Thayrone de Souza Nascimento:{" "}
                <a
                  href="mailto:thaydeveloper26@gmail.com"
                  className="underline"
                >
                  thaydeveloper26@gmail.com
                </a>
              </li>
            </ul>
          </Section>

          <Section title="2. O que é o Ajuda Minha Cidade">
            <p>
              O <strong>Ajuda Minha Cidade</strong> é uma plataforma digital
              colaborativa de caráter voluntário e sem fins lucrativos, que
              permite que cidadãos registrem e consultem em tempo real pontos de
              apoio humanitário em situações de emergência e desastre, tais como
              abrigos, pontos de coleta e distribuição de doações,
              deslizamentos e soterramentos.
            </p>
            <p>
              O serviço é disponibilizado <strong>gratuitamente</strong> e sem
              qualquer remuneração ou vantagem econômica por parte dos
              Operadores.
            </p>
          </Section>

          <Section title="3. Dados Pessoais Coletados">
            <p>
              Coletamos apenas os dados estritamente necessários para o
              funcionamento da plataforma, conforme o princípio da minimização
              previsto na LGPD (art. 6º, III):
            </p>

            <Subsection title="3.1 Dados coletados automaticamente via autenticação Google">
              <ul>
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>URL da foto de perfil</li>
              </ul>
              <p>
                Esses dados são fornecidos pelo Google mediante seu consentimento
                expresso no momento do login. Não armazenamos sua senha do
                Google.
              </p>
            </Subsection>

            <Subsection title="3.2 Dados fornecidos voluntariamente pelo usuário">
              <ul>
                <li>
                  Número de telefone de contato (opcional, associado a pontos
                  cadastrados)
                </li>
                <li>
                  Informações de localização inseridas nos pontos (endereço,
                  bairro, cidade, estado, coordenadas geográficas)
                </li>
                <li>
                  Descrições, horários de funcionamento e necessidades
                  cadastradas nos pontos
                </li>
              </ul>
            </Subsection>

            <Subsection title="3.3 Dados coletados automaticamente pelo sistema">
              <ul>
                <li>
                  Identificador de sessão e endereço IP (utilizados para
                  controle de taxa de requisições e prevenção de abuso, por meio
                  do serviço Upstash Redis)
                </li>
                <li>
                  Data e hora de criação e atualização dos registros
                </li>
                <li>
                  Logs de moderação e denúncias realizadas na plataforma
                </li>
              </ul>
            </Subsection>

            <p>
              <strong>Não coletamos</strong> dados sensíveis conforme definidos
              no art. 5º, II, da LGPD (origem racial, convicção religiosa, dado
              genético, biométrico, saúde, vida sexual ou político-partidários).
            </p>
          </Section>

          <Section title="4. Finalidade e Base Legal do Tratamento">
            <p>
              Tratamos seus dados pessoais com as seguintes finalidades e bases
              legais (art. 7º da LGPD):
            </p>
            <table className="w-full text-sm border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border px-3 py-2 text-left">Finalidade</th>
                  <th className="border border-border px-3 py-2 text-left">Base Legal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-border px-3 py-2">Autenticação e identificação do usuário</td>
                  <td className="border border-border px-3 py-2">Consentimento (art. 7º, I)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Exibição de pontos criados pelo usuário no mapa</td>
                  <td className="border border-border px-3 py-2">Execução de contrato / legítimo interesse (art. 7º, V e IX)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Prevenção de abusos e controle de taxa de requisições</td>
                  <td className="border border-border px-3 py-2">Legítimo interesse (art. 7º, IX)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Moderação comunitária e denúncias</td>
                  <td className="border border-border px-3 py-2">Legítimo interesse / proteção ao crédito (art. 7º, IX e X)</td>
                </tr>
                <tr>
                  <td className="border border-border px-3 py-2">Cumprimento de obrigação legal (ex: ordem judicial)</td>
                  <td className="border border-border px-3 py-2">Obrigação legal (art. 7º, II)</td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Section title="5. Compartilhamento com Terceiros">
            <p>
              Seus dados podem ser processados pelos seguintes suboperadores e
              prestadores de serviço, exclusivamente para os fins descritos
              nesta política:
            </p>
            <ul>
              <li>
                <strong>Supabase Inc.</strong> (EUA) — banco de dados,
                autenticação e armazenamento de arquivos. Adequado ao GDPR;
                contrato de processamento de dados disponível em
                supabase.com/privacy.
              </li>
              <li>
                <strong>Upstash Inc.</strong> (EUA) — armazenamento em memória
                para controle de taxa de requisições (rate limiting). Apenas o
                identificador de sessão e IP são processados.
              </li>
              <li>
                <strong>Mapbox Inc.</strong> (EUA) — geocodificação de endereços
                inseridos pelo usuário. Apenas o texto de busca é enviado.
              </li>
              <li>
                <strong>Open-Meteo</strong> (Suíça) — dados meteorológicos
                públicos. Apenas coordenadas geográficas dos pontos são
                enviadas.
              </li>
              <li>
                <strong>INMET</strong> (Brasil) — alertas meteorológicos
                públicos. Nenhum dado pessoal é transmitido.
              </li>
              <li>
                <strong>Google LLC</strong> (EUA) — provedor de autenticação
                OAuth. Sujeito à Política de Privacidade do Google.
              </li>
            </ul>
            <p>
              <strong>Não vendemos, cedemos ou comercializamos</strong> seus
              dados pessoais a terceiros para fins de marketing ou publicidade.
            </p>
          </Section>

          <Section title="6. Transferência Internacional de Dados">
            <p>
              Alguns dos suboperadores listados na cláusula 5 estão sediados
              fora do Brasil. As transferências internacionais ocorrem com base
              nas hipóteses previstas no art. 33 da LGPD, especialmente mediante
              garantias adequadas de proteção (contratos de processamento,
              certificações internacionais ou legislação equivalente à LGPD).
            </p>
          </Section>

          <Section title="7. Retenção e Exclusão dos Dados">
            <ul>
              <li>
                <strong>Dados de perfil:</strong> mantidos enquanto a conta
                estiver ativa. Excluídos em até 30 dias após solicitação de
                exclusão.
              </li>
              <li>
                <strong>Pontos cadastrados:</strong> mantidos enquanto ativos na
                plataforma. Pontos sem confirmação são automaticamente
                desativados após 7 dias. Pontos com 3 ou mais denúncias são
                desativados automaticamente.
              </li>
              <li>
                <strong>Logs de moderação:</strong> mantidos por até 12 meses
                para fins de auditoria e prevenção de abuso.
              </li>
              <li>
                <strong>Dados de controle de taxa (IP/sessão):</strong> retidos
                por tempo mínimo necessário ao controle de abuso (geralmente
                menos de 24 horas).
              </li>
            </ul>
          </Section>

          <Section title="8. Segurança dos Dados">
            <p>
              Adotamos medidas técnicas e organizacionais adequadas para
              proteger seus dados contra acesso não autorizado, perda, alteração
              ou divulgação indevida, incluindo:
            </p>
            <ul>
              <li>Autenticação via OAuth 2.0 (sem armazenamento de senhas)</li>
              <li>
                Políticas de Segurança em Nível de Linha (RLS) no banco de
                dados
              </li>
              <li>Comunicação exclusivamente via HTTPS/TLS</li>
              <li>
                Limitação de acesso aos dados por princípio do menor privilégio
              </li>
            </ul>
            <p>
              Nenhum sistema é 100% seguro. Em caso de incidente de segurança
              que possa gerar risco relevante aos titulares, notificaremos a
              Autoridade Nacional de Proteção de Dados (ANPD) e os usuários
              afetados nos prazos legais.
            </p>
          </Section>

          <Section title="9. Direitos do Titular dos Dados (LGPD, art. 18)">
            <p>
              Você, como titular de dados pessoais, tem os seguintes direitos,
              que podem ser exercidos a qualquer momento mediante solicitação
              aos nossos contatos:
            </p>
            <ul>
              <li>
                <strong>Confirmação e acesso:</strong> confirmar se tratamos
                seus dados e obter uma cópia.
              </li>
              <li>
                <strong>Correção:</strong> solicitar a correção de dados
                incompletos, inexatos ou desatualizados.
              </li>
              <li>
                <strong>Anonimização, bloqueio ou eliminação:</strong> de dados
                desnecessários, excessivos ou tratados em desconformidade com a
                LGPD.
              </li>
              <li>
                <strong>Portabilidade:</strong> receber seus dados em formato
                estruturado e interoperável.
              </li>
              <li>
                <strong>Eliminação:</strong> solicitar a exclusão total de seus
                dados tratados com base no consentimento.
              </li>
              <li>
                <strong>Revogação do consentimento:</strong> a qualquer
                momento, sem prejuízo da licitude do tratamento anterior.
              </li>
              <li>
                <strong>Oposição:</strong> opor-se ao tratamento realizado com
                base em legítimo interesse.
              </li>
              <li>
                <strong>Reclamação à ANPD:</strong> apresentar reclamação
                perante a Autoridade Nacional de Proteção de Dados.
              </li>
            </ul>
            <p>
              Responderemos às solicitações em até <strong>15 dias úteis</strong>{" "}
              a contar do recebimento.
            </p>
          </Section>

          <Section title="10. Cookies e Tecnologias Similares">
            <p>
              Utilizamos cookies de sessão estritamente necessários para manter
              o usuário autenticado durante a navegação. Não utilizamos cookies
              de rastreamento, publicidade ou analytics de terceiros.
            </p>
          </Section>

          <Section title="11. Menores de Idade">
            <p>
              A plataforma não é direcionada a menores de 18 anos. Não coletamos
              intencionalmente dados de menores. Caso identifiquemos que um
              menor forneceu dados sem consentimento dos responsáveis, tomaremos
              as medidas necessárias para exclusão dessas informações.
            </p>
          </Section>

          <Section title="12. Alterações nesta Política">
            <p>
              Esta Política pode ser atualizada periodicamente. Alterações
              substanciais serão comunicadas por meio de aviso na plataforma.
              O uso continuado após a publicação de alterações implica aceitação
              da versão atualizada. Recomendamos a leitura periódica deste
              documento.
            </p>
          </Section>

          <Section title="13. Lei Aplicável e Foro">
            <p>
              Esta Política é regida pelas leis da República Federativa do
              Brasil, em especial pela Lei nº 13.709/2018 (LGPD) e pelo Marco
              Civil da Internet (Lei nº 12.965/2014). Fica eleito o foro da
              comarca de domicílio dos Operadores para dirimir quaisquer
              controvérsias, com renúncia expressa a qualquer outro, por mais
              privilegiado que seja.
            </p>
          </Section>

          <Section title="14. Contato">
            <p>
              Para exercer seus direitos, tirar dúvidas ou fazer reclamações
              relacionadas à privacidade e proteção de dados, entre em contato:
            </p>
            <ul>
              <li>
                <strong>Jorge Roberto Tomaz Junior</strong>:{" "}
                <a
                  href="mailto:jorgerobertodev@gmail.com"
                  className="underline"
                >
                  jorgerobertodev@gmail.com
                </a>
              </li>
              <li>
                <strong>Thayrone de Souza Nascimento</strong>:{" "}
                <a
                  href="mailto:thaydeveloper26@gmail.com"
                  className="underline"
                >
                  thaydeveloper26@gmail.com
                </a>
              </li>
            </ul>
          </Section>
        </div>

        <div className="mt-12 pt-6 border-t flex gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Voltar ao mapa
          </Link>
          <Link href="/termos" className="hover:text-foreground transition-colors">
            Termos de Uso
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}

function Subsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2 pl-3 border-l-2 border-muted">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
