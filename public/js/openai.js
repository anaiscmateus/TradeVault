const analysisContainer = document.querySelector("#analysisContainer")

document.getElementById('feedbackBtn').addEventListener('click', async (event) => {
  event.preventDefault();
  // clear the container to make way for the loading animation and eventually openai response
  try {
    analysisContainer.innerHTML = ""

    const loadingContainer = analysisContainer.appendChild(document.createElement("div"));
    const loadingAnimation = analysisContainer.appendChild(document.createElement("div"));
  
    loadingContainer.innerHTML = '<h2 class="text-xl font-bold">Loading AI Feedback</h2>';
    loadingAnimation.innerHTML = '<span class="loading loading-dots loading-lg"></span>';
  
    fetch('/feedback')
      .then((openaiRes) => openaiRes.json()) // parse response as JSON
      .then((openaiData) => {
        analysisContainer.innerHTML = ""
        analysisContainer.classList.add("text-left")
        analysisContainer.classList.remove("text-center")

  
        const feedbackContainer = analysisContainer.appendChild(document.createElement("div"));
        const feedback = openaiData.openaiResponse.message.content;

        // Use regular expression to split on "*"
        const feedbackArray = feedback.split(/\s*\*\s*/);
        
        // Create an ordered list
        const olElement = feedbackContainer.appendChild(document.createElement("ol"));
        olElement.classList.add("list-decimal")

        // Display each non-empty bullet point as a list item
        feedbackArray.forEach((bulletPoint) => {
          const trimmedBulletPoint = bulletPoint.trim();
          if (trimmedBulletPoint !== "") {
            const liElement = olElement.appendChild(document.createElement("li"));
            liElement.classList.add('m-3')
            liElement.innerHTML = trimmedBulletPoint;
          }
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        
        // Remove the loading spinner in case of an error
        analysisContainer.innerHTML = ""
        
        // Display an error message or handle the error as needed
        analysisContainer.innerHTML = '<p>Error loading AI feedback. Please try again later.</p>';
      });
  } catch (error) {
    console.error('Error:', error);
  }  
});