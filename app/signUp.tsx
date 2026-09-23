import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';
import { styles, colors } from '../style';

// Mapeamento dos Estados e seus respectivos Campi dos Institutos Federais
const ESTADOS_CAMPUS: Record<string, { nome: string; campi: string[] }> = {
  AC: {
    nome: 'Acre',
    campi: [
      'IFAC - Campus Cruzeiro do Sul',
      'IFAC - Campus Rio Branco',
      'IFAC - Campus Rio Branco Baixada do Sol',
      'IFAC - Campus Sena Madureira',
      'IFAC - Campus Tarauacá',
      'IFAC - Campus Xapuri',
    ],
  },
  AL: {
    nome: 'Alagoas',
    campi: [
      'IFAL - Campus Arapiraca',
      'IFAL - Campus Batalha',
      'IFAL - Campus Coruripe',
      'IFAL - Campus Maceió',
      'IFAL - Campus Maceió Benedito Bentes',
      'IFAL - Campus Maragogi',
      'IFAL - Campus Marechal Deodoro',
      'IFAL - Campus Murici',
      'IFAL - Campus Palmeira dos Índios',
      'IFAL - Campus Penedo',
      'IFAL - Campus Piranhas',
      'IFAL - Campus Rio Largo',
      'IFAL - Campus Santana do Ipanema',
      'IFAL - Campus São Miguel dos Campos',
      'IFAL - Campus Satuba',
      'IFAL - Campus Viçosa',
    ],
  },
  AP: {
    nome: 'Amapá',
    campi: [
      'IFAP - Campus Laranjal do Jari',
      'IFAP - Campus Macapá',
      'IFAP - Campus Oiapoque',
      'IFAP - Campus Porto Grande',
      'IFAP - Campus Santana',
    ],
  },
  AM: {
    nome: 'Amazonas',
    campi: [
      'IFAM - Campus Coari',
      'IFAM - Campus Eirunepé',
      'IFAM - Campus Itacoatiara',
      'IFAM - Campus Lábrea',
      'IFAM - Campus Manaus Centro',
      'IFAM - Campus Manaus Distrito Industrial',
      'IFAM - Campus Manaus Zona Leste',
      'IFAM - Campus Maués',
      'IFAM - Campus Parintins',
      'IFAM - Campus Presidente Figueiredo',
      'IFAM - Campus São Gabriel da Cachoeira',
      'IFAM - Campus Tabatinga',
      'IFAM - Campus Tefé',
      'IFAM - Campus Humaitá',
      'IFAM - Campus Iranduba',
    ],
  },
  BA: {
    nome: 'Bahia',
    campi: [
      'IFBA - Campus Barreiras',
      'IFBA - Campus Brumado',
      'IFBA - Campus Camaçari',
      'IFBA - Campus Eunápolis',
      'IFBA - Campus Feira de Santana',
      'IFBA - Campus Ilhéus',
      'IFBA - Campus Irecê',
      'IFBA - Campus Jacobina',
      'IFBA - Campus Jequié',
      'IFBA - Campus Juazeiro',
      'IFBA - Campus Paulo Afonso',
      'IFBA - Campus Porto Seguro',
      'IFBA - Campus Salvador',
      'IFBA - Campus Santo Amaro',
      'IFBA - Campus Seabra',
      'IFBA - Campus Simões Filho',
      'IFBA - Campus Ubaitaba',
      'IFBA - Campus Valença',
      'IFBA - Campus Vitória da Conquista',
      'IF Baiano - Campus Alagoinhas',
      'IF Baiano - Campus Bom Jesus da Lapa',
      'IF Baiano - Campus Catu',
      'IF Baiano - Campus Guanambi',
      'IF Baiano - Campus Governador Mangabeira',
      'IF Baiano - Campus Itaberaba',
      'IF Baiano - Campus Itapetinga',
      'IF Baiano - Campus Santa Inês',
      'IF Baiano - Campus Senhor do Bonfim',
      'IF Baiano - Campus Serrinha',
      'IF Baiano - Campus Teixeira de Freitas',
      'IF Baiano - Campus Uruçuca',
      'IF Baiano - Campus Valença',
      'IF Baiano - Campus Xique-Xique',
    ],
  },
  CE: {
    nome: 'Ceará',
    campi: [
      'IFCE - Acaraú',
      'IFCE - Acopiara',
      'IFCE - Aracati',
      'IFCE - Baturité',
      'IFCE - Boa Viagem',
      'IFCE - Camocim',
      'IFCE - Canindé',
      'IFCE - Caucaia',
      'IFCE - Cedro',
      'IFCE - Crateús',
      'IFCE - Crato',
      'IFCE - Fortaleza',
      'IFCE - Guaramiranga',
      'IFCE - Horizonte',
      'IFCE - Iguatu',
      'IFCE - Itapipoca',
      'IFCE - Jaguaribe',
      'IFCE - Jaguaruana',
      'IFCE - Juazeiro do Norte',
      'IFCE - Limoeiro do Norte',
      'IFCE - Maracanaú',
      'IFCE - Maranguape',
      'IFCE - Morada Nova',
      'IFCE - Paracuru',
      'IFCE - Pecém',
      'IFCE - Quixadá',
      'IFCE - Sobral',
      'IFCE - Tabuleiro do Norte',
      'IFCE - Tauá',
      'IFCE - Tianguá',
      'IFCE - Ubajara',
      'IFCE - Umirim',
      'IFCE - Acopiara/Unidade avançada',
    ],
  },
  DF: {
    nome: 'Distrito Federal',
    campi: [
      'IFB - Campus Brasília',
      'IFB - Campus Ceilândia',
      'IFB - Campus Estrutural',
      'IFB - Campus Gama',
      'IFB - Campus Planaltina',
      'IFB - Campus Recanto das Emas',
      'IFB - Campus Riacho Fundo',
      'IFB - Campus Samambaia',
      'IFB - Campus São Sebastião',
      'IFB - Campus Taguatinga',
    ],
  },
  ES: {
    nome: 'Espírito Santo',
    campi: [
      'IFES - Alegre',
      'IFES - Aracruz',
      'IFES - Barra de São Francisco',
      'IFES - Cachoeiro de Itapemirim',
      'IFES - Cariacica',
      'IFES - Centro-Serrano',
      'IFES - Colatina',
      'IFES - Guarapari',
      'IFES - Ibatiba',
      'IFES - Itapina',
      'IFES - Linhares',
      'IFES - Montanha',
      'IFES - Nova Venécia',
      'IFES - Piúma',
      'IFES - Serra',
      'IFES - São Mateus',
      'IFES - Venda Nova do Imigrante',
      'IFES - Viana',
      'IFES - Vila Velha',
      'IFES - Vitória',
      'IFES - Campus avançado de Viana',
      'IFES - Campus avançado de Serra',
      'IFES - Campus avançado de Linhares',
    ],
  },
  GO: {
    nome: 'Goiás',
    campi: [
      'IFG - Águas Lindas de Goiás',
      'IFG - Anápolis',
      'IFG - Aparecida de Goiânia',
      'IFG - Cidade de Goiás',
      'IFG - Formosa',
      'IFG - Goiânia',
      'IFG - Goiânia Oeste',
      'IFG - Inhumas',
      'IFG - Itumbiara',
      'IFG - Jataí',
      'IFG - Luziânia',
      'IFG - Senador Canedo',
      'IFG - Uruaçu',
      'IFG - Valparaíso de Goiás',
      'IF Goiano - Campos Belos',
      'IF Goiano - Catalão',
      'IF Goiano - Ceres',
      'IF Goiano - Cristalina',
      'IF Goiano - Iporá',
      'IF Goiano - Morrinhos',
      'IF Goiano - Posse',
      'IF Goiano - Rio Verde',
      'IF Goiano - Trindade',
      'IF Goiano - Urutaí',
    ],
  },
  MA: {
    nome: 'Maranhão',
    campi: [
      'IFMA - Açailândia',
      'IFMA - Alcântara',
      'IFMA - Bacabal',
      'IFMA - Barra do Corda',
      'IFMA - Barreirinhas',
      'IFMA - Buriticupu',
      'IFMA - Carolina',
      'IFMA - Caxias',
      'IFMA - Codó',
      'IFMA - Coelho Neto',
      'IFMA - Grajaú',
      'IFMA - Imperatriz',
      'IFMA - Pedreiras',
      'IFMA - Pinheiro',
      'IFMA - Porto Franco',
      'IFMA - Presidente Dutra',
      'IFMA - Rosário',
      'IFMA - São João dos Patos',
      'IFMA - São José de Ribamar',
      'IFMA - São Luís Centro Histórico',
      'IFMA - São Luís Maracanã',
      'IFMA - São Luís Monte Castelo',
      'IFMA - Timon',
      'IFMA - Viana',
      'IFMA - Zé Doca',
    ],
  },
  MT: {
    nome: 'Mato Grosso',
    campi: [
      'IFMT - Alta Floresta',
      'IFMT - Barra do Garças',
      'IFMT - Cáceres',
      'IFMT - Campo Novo do Parecis',
      'IFMT - Confresa',
      'IFMT - Cuiabá – Cel. Octayde Jorge da Silva',
      'IFMT - Cuiabá – Bela Vista',
      'IFMT - Juína',
      'IFMT - Pontes e Lacerda',
      'IFMT - Primavera do Leste',
      'IFMT - Rondonópolis',
      'IFMT - São Vicente',
      'IFMT - Sorriso',
      'IFMT - Tangará da Serra',
      'IFMT - Várzea Grande',
      'IFMT - Guarantã do Norte',
      'IFMT - Lucas do Rio Verde',
      'IFMT - Campo Verde',
      'IFMT - Sinop',
    ],
  },
  MS: {
    nome: 'Mato Grosso do Sul',
    campi: [
      'IFMS - Aquidauana',
      'IFMS - Campo Grande',
      'IFMS - Corumbá',
      'IFMS - Coxim',
      'IFMS - Dourados',
      'IFMS - Jardim',
      'IFMS - Naviraí',
      'IFMS - Nova Andradina',
      'IFMS - Ponta Porã',
      'IFMS - Três Lagoas',
    ],
  },
  MG: {
    nome: 'Minas Gerais',
    campi: [
      'IFMG - Arcos',
      'IFMG - Bambuí',
      'IFMG - Betim',
      'IFMG - Congonhas',
      'IFMG - Formiga',
      'IFMG - Governador Valadares',
      'IFMG - Ipatinga',
      'IFMG - Ouro Branco',
      'IFMG - Ouro Preto',
      'IFMG - Piumhi',
      'IFMG - Ribeirão das Neves',
      'IFMG - Sabará',
      'IFMG - Santa Luzia',
      'IFMG - São João Evangelista',
      'IFMG - Conselheiro Lafaiete',
      'IFMG - Itabirito',
      'IFNMG - Almenara',
      'IFNMG - Araçuaí',
      'IFNMG - Arinos',
      'IFNMG - Diamantina',
      'IFNMG - Januária',
      'IFNMG - Montes Claros',
      'IFNMG - Pirapora',
      'IFNMG - Porteirinha',
      'IFNMG - Salinas',
      'IFNMG - Teófilo Otoni',
      'IFNMG - Janaúba',
      'IF Sudeste MG - Barbacena',
      'IF Sudeste MG - Bom Sucesso',
      'IF Sudeste MG - Cataguases',
      'IF Sudeste MG - Juiz de Fora',
      'IF Sudeste MG - Manhuaçu',
      'IF Sudeste MG - Muriaé',
      'IF Sudeste MG - Rio Pomba',
      'IF Sudeste MG - Santos Dumont',
      'IF Sudeste MG - São João del-Rei',
      'IF Sudeste MG - Ubá',
      'IFSULDEMINAS - Inconfidentes',
      'IFSULDEMINAS - Machado',
      'IFSULDEMINAS - Muzambinho',
      'IFSULDEMINAS - Passos',
      'IFSULDEMINAS - Poços de Caldas',
      'IFSULDEMINAS - Pouso Alegre',
      'IFSULDEMINAS - Três Corações',
      'IFSULDEMINAS - Carmo',
      'IFTM - Campina Verde',
      'IFTM - Ituiutaba',
      'IFTM - Paracatu',
      'IFTM - Patos de Minas',
      'IFTM - Patrocínio',
      'IFTM - Uberaba',
      'IFTM - Uberlândia',
      'IFTM - Uberlândia Centro',
    ],
  },
  PA: {
    nome: 'Pará',
    campi: [
      'IFPA - Abaetetuba',
      'IFPA - Altamira',
      'IFPA - Ananindeua',
      'IFPA - Belém',
      'IFPA - Bragança',
      'IFPA - Breves',
      'IFPA - Cametá',
      'IFPA - Castanhal',
      'IFPA - Conceição do Araguaia',
      'IFPA - Itaituba',
      'IFPA - Marabá Industrial',
      'IFPA - Marabá Rural',
      'IFPA - Óbidos',
      'IFPA - Paragominas',
      'IFPA - Parauapebas',
      'IFPA - Santarém',
      'IFPA - Tucuruí',
      'IFPA - Vigia',
    ],
  },
  PB: {
    nome: 'Paraíba',
    campi: [
      'IFPB - Areia',
      'IFPB - Cabedelo',
      'IFPB - Cajazeiras',
      'IFPB - Campina Grande',
      'IFPB - Catolé do Rocha',
      'IFPB - Esperança',
      'IFPB - Guarabira',
      'IFPB - Itabaiana',
      'IFPB - Itaporanga',
      'IFPB - João Pessoa',
      'IFPB - Monteiro',
      'IFPB - Patos',
      'IFPB - Picuí',
      'IFPB - Princesa Isabel',
      'IFPB - Santa Rita',
      'IFPB - Sousa',
      'IFPB - Campus avançado João Pessoa/Mangabeira',
      'IFPB - Campus avançado Soledade',
    ],
  },
  PR: {
    nome: 'Paraná',
    campi: [
      'IFPR - Assis Chateaubriand',
      'IFPR - Astorga',
      'IFPR - Barracão',
      'IFPR - Campo Largo',
      'IFPR - Capanema',
      'IFPR - Cascavel',
      'IFPR - Colombo',
      'IFPR - Curitiba',
      'IFPR - Foz do Iguaçu',
      'IFPR - Goioerê',
      'IFPR - Irati',
      'IFPR - Ivaiporã',
      'IFPR - Jacarezinho',
      'IFPR - Jaguariaíva',
      'IFPR - Londrina',
      'IFPR - Palmas',
      'IFPR - Paranaguá',
      'IFPR - Paranavaí',
      'IFPR - Pinhais',
      'IFPR - Pitanga',
      'IFPR - Quedas do Iguaçu',
      'IFPR - Telêmaco Borba',
      'IFPR - Toledo',
      'IFPR - Umuarama',
      'IFPR - União da Vitória',
    ],
  },
  PE: {
    nome: 'Pernambuco',
    campi: [
      'IFPE - Abreu e Lima',
      'IFPE - Afogados da Ingazeira',
      'IFPE - Barreiros',
      'IFPE - Belo Jardim',
      'IFPE - Cabo de Santo Agostinho',
      'IFPE - Caruaru',
      'IFPE - Garanhuns',
      'IFPE - Igarassu',
      'IFPE - Ipojuca',
      'IFPE - Jaboatão dos Guararapes',
      'IFPE - Olinda',
      'IFPE - Palmares',
      'IFPE - Paulista',
      'IFPE - Pesqueira',
      'IFPE - Recife',
      'IFPE - Vitória de Santo Antão',
      'IFSertãoPE - Floresta',
      'IFSertãoPE - Ouricuri',
      'IFSertãoPE - Petrolina',
      'IFSertãoPE - Petrolina Zona Rural',
      'IFSertãoPE - Salgueiro',
      'IFSertãoPE - Santa Maria da Boa Vista',
      'IFSertãoPE - Serra Talhada',
    ],
  },
  PI: {
    nome: 'Piauí',
    campi: [
      'IFPI - Angical',
      'IFPI - Campo Maior',
      'IFPI - Cocal',
      'IFPI - Corrente',
      'IFPI - Floriano',
      'IFPI - Oeiras',
      'IFPI - Parnaíba',
      'IFPI - Paulistana',
      'IFPI - Picos',
      'IFPI - Piripiri',
      'IFPI - São João do Piauí',
      'IFPI - São Raimundo Nonato',
      'IFPI - Teresina Central',
      'IFPI - Teresina Zona Sul',
      'IFPI - Uruçuí',
      'IFPI - Valença do Piauí',
    ],
  },
  RJ: {
    nome: 'Rio de Janeiro',
    campi: [
      'IFRJ - Arraial do Cabo',
      'IFRJ - Belford Roxo',
      'IFRJ - Duque de Caxias',
      'IFRJ - Engenheiro Paulo de Frontin',
      'IFRJ - Mesquita',
      'IFRJ - Nilópolis',
      'IFRJ - Niterói',
      'IFRJ - Paracambi',
      'IFRJ - Pinheiral',
      'IFRJ - Resende',
      'IFRJ - Rio de Janeiro',
      'IFRJ - São Gonçalo',
      'IFRJ - São João de Meriti',
      'IFRJ - Volta Redonda',
      'IFRJ - Realengo',
      'IFF - Bom Jesus do Itabapoana',
      'IFF - Cabo Frio',
      'IFF - Campos Centro',
      'IFF - Campos Guarus',
      'IFF - Itaperuna',
      'IFF - Macaé',
      'IFF - Quissamã',
      'IFF - Santo Antônio de Pádua',
      'IFF - São João da Barra',
    ],
  },
  RN: {
    nome: 'Rio Grande do Norte',
    campi: [
      'IFRN - Apodi',
      'IFRN - Caicó',
      'IFRN - Ceará-Mirim',
      'IFRN - Canguaretama',
      'IFRN - Currais Novos',
      'IFRN - Ipanguaçu',
      'IFRN - João Câmara',
      'IFRN - Lajes',
      'IFRN - Macau',
      'IFRN - Mossoró',
      'IFRN - Natal Central',
      'IFRN - Natal Cidade Alta',
      'IFRN - Natal Zona Norte',
      'IFRN - Nova Cruz',
      'IFRN - Parelhas',
      'IFRN - Parnamirim',
      'IFRN - Pau dos Ferros',
      'IFRN - Santa Cruz',
      'IFRN - São Gonçalo do Amarante',
      'IFRN - São Paulo do Potengi',
    ],
  },
  RS: {
    nome: 'Rio Grande do Sul',
    campi: [
      'IFRS - Alvorada',
      'IFRS - Bento Gonçalves',
      'IFRS - Canoas',
      'IFRS - Caxias do Sul',
      'IFRS - Erechim',
      'IFRS - Farroupilha',
      'IFRS - Feliz',
      'IFRS - Ibirubá',
      'IFRS - Osório',
      'IFRS - Porto Alegre',
      'IFRS - Restinga',
      'IFRS - Rio Grande',
      'IFRS - Rolante',
      'IFRS - Sertão',
      'IFRS - Vacaria',
      'IFRS - Veranópolis',
      'IFRS - Viamão',
      'IFFar - Alegrete',
      'IFFar - Frederico Westphalen',
      'IFFar - Jaguari',
      'IFFar - Júlio de Castilhos',
      'IFFar - Panambi',
      'IFFar - Santa Rosa',
      'IFFar - Santo Ângelo',
      'IFFar - Santo Augusto',
      'IFFar - São Borja',
      'IFFar - São Vicente do Sul',
      'IFFar - Uruguaiana',
      'IFSul - Bagé',
      'IFSul - Camaquã',
      'IFSul - Charqueadas',
      'IFSul - Gravataí',
      'IFSul - Jaguarão',
      'IFSul - Lajeado',
      'IFSul - Passo Fundo',
      'IFSul - Pelotas',
      'IFSul - Pelotas Visconde da Graça',
      'IFSul - Santana do Livramento',
      'IFSul - Sapiranga',
      'IFSul - Sapucaia do Sul',
      'IFSul - Venâncio Aires',
      'IFSul - Novo Hamburgo',
    ],
  },
  RO: {
    nome: 'Rondônia',
    campi: [
      'IFRO - Ariquemes',
      'IFRO - Cacoal',
      'IFRO - Colorado do Oeste',
      'IFRO - Guajará-Mirim',
      'IFRO - Jaru',
      'IFRO - Ji-Paraná',
      'IFRO - Porto Velho Calama',
      'IFRO - Porto Velho Zona Norte',
      'IFRO - Vilhena',
    ],
  },
  RR: {
    nome: 'Roraima',
    campi: [
      'IFRR - Amajari',
      'IFRR - Boa Vista',
      'IFRR - Boa Vista Zona Oeste',
      'IFRR - Novo Paraíso',
      'IFRR - Campus avançado Bonfim',
    ],
  },
  SC: {
    nome: 'Santa Catarina',
    campi: [
      'IFSC - Araranguá',
      'IFSC - Caçador',
      'IFSC - Canoinhas',
      'IFSC - Chapecó',
      'IFSC - Criciúma',
      'IFSC - Florianópolis',
      'IFSC - Florianópolis Continente',
      'IFSC - Garopaba',
      'IFSC - Gaspar',
      'IFSC - Itajaí',
      'IFSC - Jaraguá do Sul',
      'IFSC - Joinville',
      'IFSC - Lages',
      'IFSC - Palhoça',
      'IFSC - São Carlos',
      'IFSC - São José',
      'IFSC - São Lourenço do Oeste',
      'IFSC - Tubarão',
      'IFSC - Urupema',
      'IFC - Abelardo Luz',
      'IFC - Araquari',
      'IFC - Blumenau',
      'IFC - Brusque',
      'IFC - Camboriú',
      'IFC - Concórdia',
      'IFC - Fraiburgo',
      'IFC - Ibirama',
      'IFC - Luzerna',
      'IFC - Rio do Sul',
      'IFC - São Bento do Sul',
      'IFC - São Francisco do Sul',
      'IFC - Sombrio',
      'IFC - Videira',
    ],
  },
  SP: {
    nome: 'São Paulo',
    campi: [
      'IFSP - Araraquara',
      'IFSP - Avaré',
      'IFSP - Barretos',
      'IFSP - Bauru',
      'IFSP - Birigui',
      'IFSP - Boituva',
      'IFSP - Bragança Paulista',
      'IFSP - Campinas',
      'IFSP - Campos do Jordão',
      'IFSP - Capivari',
      'IFSP - Caraguatatuba',
      'IFSP - Catanduva',
      'IFSP - Cubatão',
      'IFSP - Guarulhos',
      'IFSP - Hortolândia',
      'IFSP - Ilha Solteira',
      'IFSP - Itapetininga',
      'IFSP - Itaquaquecetuba',
      'IFSP - Jacareí',
      'IFSP - Jundiaí',
      'IFSP - Matão',
      'IFSP - Piracicaba',
      'IFSP - Pirituba',
      'IFSP - Presidente Epitácio',
      'IFSP - Registro',
      'IFSP - Salto',
      'IFSP - São Carlos',
      'IFSP - São João da Boa Vista',
      'IFSP - São José dos Campos',
      'IFSP - São José do Rio Preto',
      'IFSP - São Miguel Paulista',
      'IFSP - São Paulo',
      'IFSP - São Roque',
      'IFSP - Sertãozinho',
      'IFSP - Sorocaba',
      'IFSP - Suzano',
      'IFSP - Taquaritinga',
      'IFSP - Tupã',
      'IFSP - Votuporanga',
    ],
  },
  SE: {
    nome: 'Sergipe',
    campi: [
      'IFS - Aracaju',
      'IFS - Estância',
      'IFS - Glória',
      'IFS - Itabaiana',
      'IFS - Lagarto',
      'IFS - Nossa Senhora do Socorro',
      'IFS - Poço Redondo',
      'IFS - Propriá',
      'IFS - São Cristóvão',
      'IFS - Tobias Barreto',
    ],
  },
  TO: {
    nome: 'Tocantins',
    campi: [
      'IFTO - Araguatins',
      'IFTO - Colinas do Tocantins',
      'IFTO - Dianópolis',
      'IFTO - Gurupi',
      'IFTO - Lagoa da Confusão',
      'IFTO - Palmas',
      'IFTO - Paraíso do Tocantins',
      'IFTO - Pedro Afonso',
      'IFTO - Porto Nacional',
    ],
  },
};

// Função utilitária para converter mensagens de erro do Supabase para Português
const traduzirErroSupabase = (mensagem: string) => {
  if (mensagem.includes('User already registered')) {
    return 'Este e-mail já está cadastrado no sistema.';
  }
  if (mensagem.includes('Password should be at least')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (mensagem.includes('Invalid email')) {
    return 'Por favor, insira um endereço de e-mail válido.';
  }
  if (mensagem.includes('Signup requires a valid password')) {
    return 'Informe uma senha válida.';
  }
  return mensagem;
};

export default function SignUp() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role: string }>();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Estado para UF e Campus selecionados
  const [selectedEstado, setSelectedEstado] = useState('');
  const [campus, setCampus] = useState('');

  const [curso, setCurso] = useState('');
  const [turno, setTurno] = useState('');
  const [turma, setTurma] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [areaAtuacao, setAreaAtuacao] = useState('');
  const [loading, setLoading] = useState(false);

  // Controle dos Modais de Seleção
  const [modalEstadoVisible, setModalEstadoVisible] = useState(false);
  const [modalCampusVisible, setModalCampusVisible] = useState(false);

  const selectedRole = role || 'Estudante';

  const getTipoUsuario = () => {
    const tipo = selectedRole.toLowerCase();

    if (tipo.includes('aluno') || tipo.includes('estudante')) {
      return 'estudante';
    }

    if (tipo.includes('professor')) {
      return 'professor';
    }

    if (tipo.includes('tutor')) {
      return 'tutor';
    }

    return 'estudante';
  };

  const tipoUsuario = getTipoUsuario();

  // Lista de campi do estado atualmente selecionado
  const campiDisponiveis = useMemo(() => {
    if (!selectedEstado || !ESTADOS_CAMPUS[selectedEstado]) return [];
    return ESTADOS_CAMPUS[selectedEstado].campi;
  }, [selectedEstado]);

  // Verifica se o e-mail possui o formato institucional .edu.br
  const emailInstitucionalValido = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.edu\.br$/i.test(email.trim());
  };

  const handleSignUp = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !selectedEstado ||
      !campus.trim()
    ) {
      Alert.alert(
        'Atenção',
        'Preencha nome, email, senha, estado e campus.'
      );
      return;
    }

    if (
      tipoUsuario === 'estudante' &&
      (!curso.trim() || !turno.trim() || !turma.trim())
    ) {
      Alert.alert('Atenção', 'Preencha curso, turno e turma.');
      return;
    }

    if (tipoUsuario === 'tutor' && !departamento.trim()) {
      Alert.alert('Atenção', 'Preencha o departamento do tutor.');
      return;
    }

    if (tipoUsuario === 'professor' && !areaAtuacao.trim()) {
      Alert.alert('Atenção', 'Preencha a área de atuação do professor.');
      return;
    }

    if (!emailInstitucionalValido(email)) {
      Alert.alert(
        'E-mail inválido',
        'Utilize um endereço de e-mail institucional terminado em .edu.br.'
      );
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            estado: selectedEstado,
            campus: campus.trim(),
            role: tipoUsuario,

            // Dados do estudante
            curso: curso.trim(),
            turno: turno.trim(),
            turma: turma.trim(),

            // Dados do professor
            areaAtuacao: areaAtuacao.trim(),

            // Dados do tutor
            departamento: departamento.trim(),
          },
        },
      });

      if (authError) {
        Alert.alert(
          'Erro ao cadastrar',
          traduzirErroSupabase(authError.message)
        );
        return;
      }

      // Como a confirmação de e-mail está ativada no Supabase,
      // o usuário ainda não terá uma sessão autenticada neste momento.
      // O trigger do banco cria automaticamente o perfil nas tabelas
      // usuarios, alunos, professores ou tutores.
      Alert.alert(
        'Cadastro realizado!',
        'Sua conta foi criada. Enviamos um e-mail de confirmação para o endereço informado. Confirme seu e-mail antes de fazer login.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Erro',
        'Ocorreu um erro inesperado ao realizar o cadastro.'
      );
    } finally {
      setLoading(false);
    }
  };

  const listaEstados = useMemo(() => {
    return Object.keys(ESTADOS_CAMPUS).map((uf) => ({
      uf,
      nome: ESTADOS_CAMPUS[uf].nome,
    }));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/logo_PAED.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.signUpCardTitle}>
              Criar conta - {selectedRole}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor={colors.placeholder}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.edu.br"
                placeholderTextColor={colors.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={{ color: colors.text, fontSize: 12, marginTop: 5 }}>
                Use seu e-mail institucional terminado em .edu.br
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.placeholder}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Seleção de Estado */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estado (UF)</Text>
              <Pressable
                style={styles.input}
                onPress={() => setModalEstadoVisible(true)}
              >
                <Text style={{ color: selectedEstado ? colors.text : colors.placeholder }}>
                  {selectedEstado
                    ? `${ESTADOS_CAMPUS[selectedEstado].nome} (${selectedEstado})`
                    : 'Selecione o estado'}
                </Text>
              </Pressable>
            </View>

            {/* Seleção de Campus */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus</Text>
              <Pressable
                style={[styles.input, !selectedEstado && { opacity: 0.5 }]}
                onPress={() => {
                  if (!selectedEstado) {
                    Alert.alert('Atenção', 'Selecione um estado primeiro.');
                    return;
                  }
                  setModalCampusVisible(true);
                }}
              >
                <Text style={{ color: campus ? colors.text : colors.placeholder }}>
                  {campus || (selectedEstado ? 'Selecione o campus' : 'Selecione o estado primeiro')}
                </Text>
              </Pressable>
            </View>

            {tipoUsuario === 'estudante' && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Curso</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex.: Informática"
                    placeholderTextColor={colors.placeholder}
                    value={curso}
                    onChangeText={setCurso}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Turno</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex.: Manhã, Tarde ou Noite"
                    placeholderTextColor={colors.placeholder}
                    value={turno}
                    onChangeText={setTurno}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Turma</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex.: 3ºA"
                    placeholderTextColor={colors.placeholder}
                    value={turma}
                    onChangeText={setTurma}
                  />
                </View>
              </>
            )}

            {tipoUsuario === 'tutor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Departamento</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: NAPNE, Seção Pedagógica..."
                  placeholderTextColor={colors.placeholder}
                  value={departamento}
                  onChangeText={setDepartamento}
                />
              </View>
            )}

            {tipoUsuario === 'professor' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Área de atuação</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: Letras, Informática..."
                  placeholderTextColor={colors.placeholder}
                  value={areaAtuacao}
                  onChangeText={setAreaAtuacao}
                />
              </View>
            )}

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.backButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.back()}
                disabled={loading}
              >
                <Text style={styles.backButtonText}>Voltar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Criar conta</Text>
                )}
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de Seleção de Estado */}
      <Modal
        visible={modalEstadoVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalEstadoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Estado</Text>
              <Pressable onPress={() => setModalEstadoVisible(false)}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </Pressable>
            </View>

            <FlatList
              data={listaEstados}
              keyExtractor={(item) => item.uf}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedEstado(item.uf);
                    setCampus(''); // Reseta o campus quando troca o estado
                    setModalEstadoVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>
                    {item.nome} ({item.uf})
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Campus */}
      <Modal
        visible={modalCampusVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalCampusVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione o Campus</Text>
              <Pressable onPress={() => setModalCampusVisible(false)}>
                <Text style={styles.modalCloseText}>Fechar</Text>
              </Pressable>
            </View>

            <FlatList
              data={campiDisponiveis}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    setCampus(item);
                    setModalCampusVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}