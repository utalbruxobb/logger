const express = require('express');
const request = require('request');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Função para gerar nome de arquivo
function generateFileName() {
  const existingFiles = fs.readdirSync('results').length;
  const nextFileNumber = existingFiles + 1;
  return `resultado-${nextFileNumber}.txt`;
}

// Endpoint para capturar IP e salvar informações
app.get('/', (req, res) => {
  // Fazer a requisição para obter o IP do usuário
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) {
      console.error(error);
      res.status(500).send('Falha ao obter o IP do usuário');
      return;
    }

    const ip = JSON.parse(body).ip;

    // Fazer a requisição para obter as informações de localização
    request(`http://ip-api.com/json/${ip}`, (error2, response2, body2) => {
      if (error2) {
        console.error(error2);
        res.status(500).send('Falha ao obter informações de localização');
        return;
      }

      const locationInfo = JSON.parse(body2);

      // Gerar nome do arquivo
      const fileName = generateFileName();

      // Formatar as informações de localização em texto
      const formattedText = `
        **Localização do Usuário:**

        País: ${locationInfo.country}
        Código do País: ${locationInfo.countryCode}
        Região: ${locationInfo.region}
        Nome da Região: ${locationInfo.regionName}
        Cidade: ${locationInfo.city}
        CEP: ${locationInfo.zip}
        Latitude: ${locationInfo.lat}
        Longitude: ${locationInfo.lon}
        Fuso Horário: ${locationInfo.timezone}
        ISP: ${locationInfo.isp}
        Organização: ${locationInfo.org}
        AS: ${locationInfo.as}
        IP: ${ip}
      `;

      // Salvar o texto formatado no arquivo
      fs.writeFileSync(`results/${fileName}`, formattedText);

      // Exibir mensagem de sucesso no console
      console.log(`Localização do usuário salva em results/${fileName}`);
      res.send('Localização do usuário obtida e salva com sucesso!');
    });
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado na porta ${port}`);
});
