// Função para compartilhar o veículo
function shareVehicle(title, description, imageUrl) {
    if (navigator.share) {
        navigator.share({
            title: title,
            text: description,
            url: imageUrl, // Em um ambiente real, você usaria o URL da página do veículo
        })
        .then(() => console.log('Compartilhado com sucesso!'))
        .catch((error) => console.log('Erro ao compartilhar:', error));
    } else {
        // Fallback para navegadores que não suportam a API Web Share
        alert(`Compartilhar: ${title}\n${description}\nLink: ${imageUrl}`);
    }
}

// Função para alternar a descrição detalhada usando a API Gemini
async function toggleDescription(vehicleTitle, descriptionElementId) {
    const descriptionElement = document.getElementById(descriptionElementId);
    // O botão "Ler Mais..." é o terceiro elemento irmão após o <p> (descrição, div com botões sociais, então o botão ler mais)
    // Ajuste o seletor se a estrutura HTML mudar
    const button = descriptionElement.nextElementSibling.nextElementSibling; 

    // Se a descrição completa já estiver visível, volte para a curta
    if (descriptionElement.dataset.fullDescription && descriptionElement.innerText === descriptionElement.dataset.fullDescription) {
        descriptionElement.innerText = descriptionElement.dataset.shortDescription;
        button.innerText = 'Ler Mais...';
        return;
    }

    // Se a descrição completa ainda não foi gerada ou não está visível
    if (!descriptionElement.dataset.fullDescription) {
        const originalText = descriptionElement.innerText;
        descriptionElement.innerText = 'Gerando descrição...'; // Indicador de carregamento
        button.disabled = true; // Desabilita o botão enquanto carrega

        let chatHistory = [];
        const prompt = `Crie uma descrição de venda detalhada e atraente para o veículo "${vehicleTitle}" com base na seguinte descrição inicial: "${originalText}". Inclua detalhes sobre benefícios, estilo de vida e diferenciais, e seja persuasivo.`;
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = { contents: chatHistory };
        const apiKey = ""; // A chave da API será fornecida em tempo de execução pelo Canvas ou inserida aqui
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                descriptionElement.dataset.fullDescription = text; // Armazena a descrição completa
                descriptionElement.innerText = text; // Atualiza a descrição visível
                button.innerText = 'Mostrar Menos';
            } else {
                descriptionElement.innerText = originalText; // Reverte para o texto original em caso de erro
                console.error('Estrutura de resposta inesperada:', result);
            }
        } catch (error) {
            descriptionElement.innerText = originalText; // Reverte para o texto original em caso de erro
            console.error('Erro ao chamar a API Gemini:', error);
        } finally {
            button.disabled = false; // Reabilita o botão
        }
    } else {
        // Se a descrição completa já existe, apenas alterna
        descriptionElement.innerText = descriptionElement.dataset.fullDescription;
        button.innerText = 'Mostrar Menos';
    }
}
