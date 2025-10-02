import React from 'react';

const ScrollableContent: React.FC = () => {
  return (
    <>
      <h2>📜 Conteúdo Scrollável</h2>
      <p>Esta div tem altura fixa e conteúdo que excede essa altura, forçando a barra de rolagem vertical nativa.</p>

      {Array.from({ length: 20 }, (_, index) => (
        <div key={index} className="content-section">
          <h3>Seção {index + 1}</h3>
          <p>
            Este é o conteúdo da seção {index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </p>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
          </p>
        </div>
      ))}

      <div className="footer-section">
        <h3>🎯 Fim do Conteúdo</h3>
        <p>Você chegou ao final!</p>
      </div>

      <div style={{ height: '2000px', background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)', margin: '20px 0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold', flexDirection: 'column' }}>
        <div>🎯 ELEMENTO DE TESTE PARA SCROLL</div>
        <div style={{ fontSize: '16px', marginTop: '20px' }}>
          Este elemento tem 2000px de altura para garantir que o scroll apareça
        </div>
      </div>
    </>
  );
};

export default ScrollableContent;


