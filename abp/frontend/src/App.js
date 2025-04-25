import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import L from 'leaflet';
import axios from 'axios';

// Array de estados do Brasil (siglas e nomes)
const estados = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

// Array de biomas
const biomas = [
  { id: 'Amazônia', nome: 'Amazônia' },
  { id: 'Caatinga', nome: 'Caatinga' },
  { id: 'Cerrado', nome: 'Cerrado' },
  { id: 'Mata Atlântica', nome: 'Mata Atlântica' },
  { id: 'Pantanal', nome: 'Pantanal' },
  { id: 'Pampa', nome: 'Pampa' },
];

function App() {
  const [mapData, setMapData] = useState(null);
  const [filtro, setFiltro] = useState('focos-estado');
  const [valor, setValor] = useState('');
  const [bioma, setBioma] = useState('');
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([-15, -55], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
  }, []);

  const fetchData = async () => {
    if (!valor && !bioma) return alert('Selecione um valor válido para estado ou bioma');
    
    console.log('Realizando requisição com dados:', { valor, bioma, filtro });

    try {
      const params = filtro === 'focos-estado' || filtro === 'area-estado' ? { estado: valor } : { bioma };
      const response = await axios.get(`http://localhost:4000/api/${filtro}`, { params });
      console.log('Resposta da API:', response.data);

      // Remove camada anterior se existir
      if (mapRef.current?.geoJsonLayer) {
        mapRef.current.removeLayer(mapRef.current.geoJsonLayer);
      }

      mapRef.current.geoJsonLayer = L.geoJSON(response.data).addTo(mapRef.current);
      setMapData(response.data);
    } catch (error) {
      console.error('Erro ao carregar os dados:', error);
    }
  };

  return (
    <div className="App">
      <h1>Mapa de Focos e Áreas Queimadas</h1>
      
      <div className="filtros">
        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="focos-estado">Foco por Estado</option>
          <option value="focos-bioma">Foco por Bioma</option>
          <option value="area-estado">Área Queimada por Estado</option>
          <option value="area-bioma">Área Queimada por Bioma</option>
        </select>

        {/* Seleção de Estado */}
        {filtro === 'focos-estado' || filtro === 'area-estado' ? (
          <select 
            value={valor} 
            onChange={(e) => setValor(e.target.value)}
          >
            <option value="">Selecione um Estado</option>
            {estados.map((estado) => (
              <option key={estado.sigla} value={estado.sigla}>
                {estado.nome}
              </option>
            ))}
          </select>
        ) : null}

        {/* Seleção de Bioma */}
        {filtro === 'focos-bioma' || filtro === 'area-bioma' ? (
          <select 
            value={bioma} 
            onChange={(e) => setBioma(e.target.value)}
          >
            <option value="">Selecione um Bioma</option>
            {biomas.map((biomaOption) => (
              <option key={biomaOption.id} value={biomaOption.id}>
                {biomaOption.nome}
              </option>
            ))}
          </select>
        ) : null}

        <button onClick={fetchData}>Filtrar</button>
      </div>

      <div ref={mapContainerRef} id="map" style={{ height: '1200px', width: '100%' }}></div>
    </div>
  );
}

export default App;
