import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import L from 'leaflet';
import axios from 'axios';

// Array de estados do Brasil (siglas e nomes) sigla = id
const estados = [
  { sigla: '12', nome: 'Acre' },
  { sigla: '27', nome: 'Alagoas' },
  { sigla: '16', nome: 'Amapá' },
  { sigla: '13', nome: 'Amazonas' },
  { sigla: '29', nome: 'Bahia' },
  { sigla: '23', nome: 'Ceará' },
  { sigla: '53', nome: 'Distrito Federal' },
  { sigla: '32', nome: 'Espírito Santo' },
  { sigla: '52', nome: 'Goiás' },
  { sigla: '21', nome: 'Maranhão' },
  { sigla: '51', nome: 'Mato Grosso' },
  { sigla: '50', nome: 'Mato Grosso do Sul' },
  { sigla: '31', nome: 'Minas Gerais' },
  { sigla: '15', nome: 'Pará' },
  { sigla: '25', nome: 'Paraíba' },
  { sigla: '41', nome: 'Paraná' },
  { sigla: '26', nome: 'Pernambuco' },
  { sigla: '22', nome: 'Piauí' },
  { sigla: '33', nome: 'Rio de Janeiro' },
  { sigla: '24', nome: 'Rio Grande do Norte' },
  { sigla: '43', nome: 'Rio Grande do Sul' },
  { sigla: '11', nome: 'Rondônia' },
  { sigla: '14', nome: 'Roraima' },
  { sigla: '42', nome: 'Santa Catarina' },
  { sigla: '35', nome: 'São Paulo' },
  { sigla: '28', nome: 'Sergipe' },
  { sigla: '17', nome: 'Tocantins' }
];


// Array de biomas
const biomas = [
  { id: '1', nome: 'Amazônia' },
  { id: '2', nome: 'Caatinga' },
  { id: '3', nome: 'Cerrado' },
  { id: '4', nome: 'Mata Atlântica' },
  { id: '5', nome: 'Pantanal' },
  { id: '6', nome: 'Pampa' },
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
