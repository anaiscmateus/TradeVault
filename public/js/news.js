// GOAL: THE USER ENTERS A SYMBOL. THE USER INPUT WILL THEN BE SENT TO AN API AND RETRIEVE THE NEWS FOR THAT STOCK AND DISPLAY IT ON THE DOM
const userInput = document.querySelector("#stockInput");
const articlesContainer = document.querySelector('#articlesContainer')
const newsContainer = document.querySelector('#newsContainer')
const mainContainer = document.querySelector('#mainContainer')
const headingSection = document.querySelector('#headingSection')

document.querySelector(".submitBtn").addEventListener("click", fetchStockNews); // add event listener to submit button that will get stock news when clicked

function fetchStockNews() {
  const symbol = userInput.value.toUpperCase();
  userInput.value = ""; // reset input value

  if (symbol) {
    fetch(`/stock-news?symbol=${encodeURIComponent(symbol)}`)
      .then((newsRes) => newsRes.json())
      .then((newsData) => {
        // Clear existing articles by setting the innerHTML to an empty string
        mainContainer.classList.add("mt-14")
        newsContainer.classList.add("h-full")
        articlesContainer.innerHTML = "";
        headingSection.innerHTML = "";

        const headlinesHeading = headingSection.appendChild(document.createElement("h2"))
        headingSection.classList.add("mt-6")
        headlinesHeading.classList.add('text-2xl')
        headlinesHeading.classList.add('font-semibold')
        headlinesHeading.innerText =
          `Top Headlines for $${symbol}`;

        // loop through the first three articles
        for (let i = 0; i < 3; i++) {
          createElement(newsData, i, symbol);
        }
      })
      .catch((err) => {
        console.log(`error ${err}`);
      });
  }

}

function createElement(data, i, symbol) {
  // create new article element
  let article = articlesContainer
    .appendChild(document.createElement("article"));
    article.classList.add("flex-col");
    article.classList.add("my-3");
    article.classList.add("p-3");
    article.classList.add("md:w-1/3");

  // create article image
  let articleImage = article.appendChild(document.createElement("div"));
  let img = articleImage.appendChild(document.createElement("img"));
  articleImage.classList.add("w-full");
  articleImage.classList.add("h-72");
  img.classList.add("w-full");
  img.classList.add("h-full");

  // create the h3 element for the article title
  let description = article.appendChild(document.createElement("div"));
  let title = description.appendChild(document.createElement("h3"));
  title.classList.add("text-xl");
  title.classList.add("mb-3");

  // create new text for authors, summary, and article sentiment on the stock
  let articleDate = description.appendChild(document.createElement("p"));
  articleDate.classList.add("mb-2");

  let authors = description.appendChild(document.createElement("p"));
  authors.classList.add("mb-2");
  authors.classList.add("text-blue-500")

  let summary = description.appendChild(document.createElement("p"));
  summary.classList.add("mb-2");

  let sentiment = description.appendChild(document.createElement("p"));
  sentiment.classList.add("mb-2");
  sentiment.classList.add("text-blue-500");

  // get and break up date
  let date = data.feed[i].time_published;
  let year = date.slice(0, 4);
  let month = date.slice(4, 6);
  let day = date.slice(6, 8);

  // get banner image
  let banner_image = data.feed[i].banner_image;

  // passing in values
  // handle missing images
  if (banner_image == null) {
    img.src =
      "https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg";
  } else {
    img.src = banner_image; // pass in the image url to the article image src
  }

  title.innerHTML = `<a href="${data.feed[i].url}" target="_blank">${data.feed[i].title}</a>`; // pass in the article url and article title to the h3 tag

  // pass in the article date, authors, summary, and article sentiment
  articleDate.innerHTML = `Published: ${month}-${day}-${year}`;
  authors.innerHTML = `${data.feed[i].authors} | <a href="${data.feed[i].url}" target="_blank">${data.feed[i].source}</a>`;
  summary.innerHTML = data.feed[i].summary;
  sentiment.innerHTML = `Sentiment: ${data.feed[i].overall_sentiment_label}`;
}