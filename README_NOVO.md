# EcomLytics - Planejador Financeiro Pro

> Plataforma profissional de planejamento e análise financeira para e-commerce

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.8.2-3178c6.svg)
![Tailwind](https://img.shields.io/badge/tailwind-3.4.18-38bdf8.svg)

---

## 🚀 Características Principais

### Planejamento Financeiro
- **Planejamento Anual (OPEX)** - Gestão completa de despesas operacionais
- **Planejamento de Metas** - Definição e acompanhamento de objetivos
- **Precificação Inteligente** - Calculadora avançada de preços
- **Cenários Múltiplos** - Base, Corte de Gastos, Aposta de Crescimento

### Análise e Relatórios
- **Dashboard Executivo** - Visão consolidada do negócio
- **Painel de Controle** - Métricas em tempo real
- **Relatórios Avançados** - Análises detalhadas e comparativas
- **Exportação de Dados** - Excel, PDF e CSV

### Visualização de Dados
- **Gráficos Interativos** - Recharts com tooltips e legendas
- **Composição OPEX** - Gráficos de pizza e barras
- **Tendências Temporais** - Gráficos de linha
- **Comparativos** - Orçado vs. Realizado

### Experiência do Usuário
- **Dark Mode** - Tema claro e escuro
- **Responsivo** - Desktop, tablet e mobile
- **Loading States** - Skeleton loaders e spinners
- **Animações Suaves** - Transições profissionais

---

## 📦 Tecnologias Utilizadas

### Core
- **React 18.2** - Biblioteca UI
- **TypeScript 5.8** - Tipagem estática
- **Vite 6.4** - Build tool ultrarrápido

### UI/UX
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **Recharts 3.4** - Gráficos React
- **Framer Motion 12.2** - Animações avançadas
- **Lucide React** - Ícones modernos

### Funcionalidades
- **XLSX** - Exportação Excel
- **jsPDF** - Geração de PDF
- **jsPDF AutoTable** - Tabelas em PDF

---

## 🛠️ Instalação e Uso

### Pré-requisitos
- Node.js 18+ 
- pnpm 8+ (recomendado) ou npm/yarn

### Instalação

```bash
# Clonar o repositório
git clone <seu-repositorio>

# Entrar na pasta
cd ecomlitycs---planejador-financeiro

# Instalar dependências
pnpm install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
pnpm dev

# Acessar em http://localhost:3000
```

### Build de Produção

```bash
# Gerar build otimizado
pnpm build

# Preview do build
pnpm preview
```

---

## 📁 Estrutura do Projeto

```
ecomlitycs/
├── components/           # Componentes React
│   ├── charts/          # Gráficos Recharts
│   │   ├── BarChart.tsx
│   │   ├── PieChart.tsx
│   │   └── LineChart.tsx
│   ├── ExportButton.tsx # Exportação de dados
│   ├── LoadingSpinner.tsx
│   ├── Skeleton.tsx
│   ├── AnnualPlanningDashboard.tsx
│   ├── MainDashboard.tsx
│   ├── PlanningDashboard.tsx
│   ├── PricingCalculator.tsx
│   ├── TacticalTracking.tsx
│   ├── ReportsDashboard.tsx
│   ├── ControlPanel.tsx
│   ├── Sidebar.tsx
│   ├── ThemeToggle.tsx
│   └── ...
├── utils/               # Utilitários
│   ├── exportUtils.ts  # Exportação Excel/PDF/CSV
│   └── formatting.ts   # Formatação de dados
├── src/
│   └── index.css       # Estilos Tailwind
├── App.tsx             # Componente principal
├── index.tsx           # Entry point
├── types.ts            # Definições TypeScript
├── tailwind.config.js  # Configuração Tailwind
├── vite.config.ts      # Configuração Vite
└── package.json
```

---

## 🎨 Componentes Disponíveis

### Skeleton Loader
```tsx
import Skeleton from './components/Skeleton';

<Skeleton variant="text" width="200px" />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" height={200} />
```

### Loading Spinner
```tsx
import LoadingSpinner from './components/LoadingSpinner';

<LoadingSpinner size="md" />
```

### Botão de Exportação
```tsx
import ExportButton from './components/ExportButton';

const data = {
  headers: ['Categoria', 'Valor', 'Percentual'],
  rows: [['Funcionários', 'R$ 84.000,00', '74,47%']],
  filename: 'relatorio-opex',
  title: 'Relatório OPEX 2025'
};

<ExportButton data={data} formats={['excel', 'pdf', 'csv']} />
```

### Gráficos

#### Gráfico de Barras
```tsx
import BarChart from './components/charts/BarChart';

<BarChart 
  data={monthlyData}
  xAxisKey="month"
  dataKeys={[
    { key: 'orcado', name: 'Orçado', color: '#2563EB' },
    { key: 'realizado', name: 'Realizado', color: '#16A34A' }
  ]}
  height={300}
/>
```

#### Gráfico de Pizza
```tsx
import PieChart from './components/charts/PieChart';

<PieChart 
  data={opexComposition}
  colors={['#2563EB', '#F59E0B', '#16A34A', '#DC2626']}
  height={300}
/>
```

#### Gráfico de Linha
```tsx
import LineChart from './components/charts/LineChart';

<LineChart 
  data={trendData}
  xAxisKey="date"
  dataKeys={[
    { key: 'revenue', name: 'Receita', color: '#2563EB' }
  ]}
  height={300}
/>
```

---

## 🎯 Funcionalidades por Módulo

### 📊 Planejamento Anual (OPEX)
- Orçamento anual por categoria
- Múltiplos cenários (Base, Corte, Crescimento)
- Comparação com ano anterior
- Edição inline de valores mensais
- Pesos sazonais customizáveis
- KPIs: OPEX/Receita, OPEX/Pedido, Delta vs. Anterior

### 📈 Dashboard Principal
- Receita realizada
- Margem de contribuição
- ROAS (Return on Ad Spend)
- Ranking de produtos
- Taxa de conversão
- Ticket médio
- Total de pedidos

### 💰 Calculadora de Precificação
- Custo do produto
- Taxas e impostos
- Margem desejada
- Preço sugerido
- Breakdown detalhado

### 📋 Acompanhamento Tático
- Metas diárias
- Progresso em tempo real
- Alertas de desvio
- Histórico de performance

### 📄 Relatórios
- Relatórios executivos
- Comparativos mensais
- Análise de tendências
- Exportação em múltiplos formatos

---

## 🎨 Design System

### Cores Principais
```css
Primary: #2563EB (Azul)
Success: #16A34A (Verde)
Warning: #F59E0B (Laranja)
Danger: #DC2626 (Vermelho)
```

### Tipografia
```css
Sans: Inter, system-ui
Headings: Poppins
```

### Animações
- `fade-in`: Entrada suave
- `slide-in`: Deslizamento
- `scale-in`: Zoom
- `shimmer`: Efeito skeleton

---

## 📊 Performance

### Métricas de Build
- **CSS**: 60.65 kB → 10.91 kB (gzip) - 82% redução
- **JS**: 292.08 kB → 80.17 kB (gzip) - 73% redução
- **HTML**: 1.48 kB → 0.70 kB (gzip)
- **Build Time**: ~47 segundos

### Otimizações
✅ Tree-shaking de CSS  
✅ Code splitting  
✅ Minificação  
✅ Compressão gzip  
✅ Lazy loading preparado  

---

## 🌐 Compatibilidade

### Navegadores
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

### Dispositivos
- Desktop (1920x1080+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
GEMINI_API_KEY=sua_chave_api_aqui
```

---

## 📝 Scripts Disponíveis

```json
{
  "dev": "vite",              // Servidor de desenvolvimento
  "build": "vite build",      // Build de produção
  "preview": "vite preview"   // Preview do build
}
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é privado e proprietário.

---

## 👥 Autores

**Equipe EcomLytics**

---

## 🙏 Agradecimentos

- React Team
- Tailwind Labs
- Recharts Contributors
- Vite Team

---

## 📞 Suporte

Para suporte, entre em contato através de:
- Email: suporte@ecomlitycs.com
- Website: https://ecomlitycs.com

---

**Desenvolvido com ❤️ para e-commerce**
