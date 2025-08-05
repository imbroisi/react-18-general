import React, { useMemo } from 'react';
import './App.css';
import DraggableTable from './components/DraggableTable';

const sobrenomes = [
  'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 
  'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 
  'Alves', 'Lopes', 'Soares', 'Fernandes', 'Vieira', 'Barbosa'
];

const nomes = [
  'João', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Lucia', 'Fernando', 'Juliana',
  'Ricardo', 'Patricia', 'Marcos', 'Camila', 'Andre', 'Gabriela', 'Lucas',
  'Isabela', 'Rafael', 'Mariana', 'Diego', 'Carolina', 'Thiago', 'Beatriz'
];

const cidades = [
  'São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília',
  'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Manaus', 'Belém',
  'Goiânia', 'Guarulhos', 'Campinas', 'Nova Iguaçu', 'São Gonçalo'
];

const esportes = [
  'Futebol', 'Basquete', 'Vôlei', 'Tênis', 'Natação', 'Corrida', 'Ciclismo',
  'Handebol', 'Atletismo', 'Ginástica', 'Boxe', 'MMA', 'Surf', 'Skate',
  'Yoga', 'Pilates', 'Crossfit', 'Musculação', 'Dança'
];



function App() {
  const tableData = useMemo(() => {
    const data: string[][] = [];
    const nomesUsados = new Set<string>();
    
    for (let i = 0; i < 8; i++) {
      const row: string[] = [];
      
      let nomeCompleto: string;
      do {
        const nome = nomes[Math.floor(Math.random() * nomes.length)];
        const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
        nomeCompleto = `${nome} ${sobrenome}`;
      } while (nomesUsados.has(nomeCompleto));
      nomesUsados.add(nomeCompleto);
      

      
      // Sobrenome com número sequencial
      const sobrenome = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
      const sobrenomeComNumero = `${sobrenome} ${i + 1}`;
      
      // Sobrenome
      row.push(sobrenomeComNumero);
      
      // CEP (formato: 00000-000)
      const cep = `${String(Math.floor(Math.random() * 90000) + 10000)}-${String(Math.floor(Math.random() * 900) + 100)}`;
      row.push(cep);
      
      // Esporte
      row.push(esportes[Math.floor(Math.random() * esportes.length)]);
      
      // Idade (18-80 anos)
      row.push(Math.floor(Math.random() * 63) + 18 + ' anos');
      
      // Sexo
      row.push(Math.random() > 0.5 ? 'Masculino' : 'Feminino');
      
      // Cidade
      row.push(cidades[Math.floor(Math.random() * cidades.length)]);
      
      data.push(row);
    }
    
    return data;
  }, []);

  return (
    <div className="App">
      <h1>Tabela com Drag and Drop</h1>
      
      <DraggableTable 
        rows={8} 
        cols={6} 
        data={tableData}
        columnHeaders={['Sobrenome', 'CEP', 'Esporte', 'Idade', 'Sexo', 'Cidade']}
        rowHeaders={Array.from({ length: 8 }, (_, i) => {
          const nome = nomes[Math.floor(Math.random() * nomes.length)];
          return `${nome} ${i + 1}`;
        })}
        fixedColumns={2}
      />

      {/* <NestedDivs leftMargin={120} 
        text="Hello, world! This is a long text that should be truncated if it exceeds the width of the container." /> */}

      {/* <h1>Progress Bar Examples</h1>
      
      <div style={{ padding: '20px' }}>
        <h3>Default Progress Bar</h3>
        <ProgressBar value={progress} />
        
        <h3>Custom Color Progress Bar</h3>
        <ProgressBar value={progress} color="#4caf50" />
        
        <h3>Taller Progress Bar</h3>
        <ProgressBar value={progress} height={16} color="#f44336" />
        
        <h3>Without Value Indicator</h3>
        <ProgressBar value={progress} showValue={false} color="#9c27b0" />
      </div> */}
    </div>
  );
}

export default App;
