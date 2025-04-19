// functions that it contains:-
// open a website
//open a website and search for something on it 
//tell a song and it will directly search it on youtube
// tells the current weather report
// tells the current newest news
//tells the current date and time 
//translates languages to others
//casual commands like hello, how are you? etc
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-US";
const btn = document.querySelector("#listen-btn");
const container = document.querySelector(".container");
const btnVideo = document.createElement("video");
btnVideo.src = "btnBG.mp4";
btnVideo.autoplay = true;
btnVideo.loop = true;
btnVideo.muted = true;
btnVideo.classList.add("btn-video");
btn.appendChild(btnVideo);
const weatherApiKey = "2925de15d29e8794298c197351895ec8";
const newsApiKey = "250e7c75eefc4a46acdd6f6e8817be09";

const casualTalk = {
  "how are you": "I'm just a bunch of code, but I'm feeling pretty good!",
  "what is your name": "I'm your smart assistant!",
  "tell me a joke": "Why don’t scientists trust atoms? Because they make up everything!",
  "are you real": "As real as your browser lets me be!",
  "what can you do": "I can open websites, play songs, get the weather, translate languages and chat casually too!",
  "i am bored": "Let’s play a game! Or maybe ask me to tell a joke?",
  "thank you": "You're welcome!",
  "hello": "Hello there! How can I assist you today?",
  "hi": "Hi! I'm here to help.",
  "goodbye": "See you later! Have a great day."
};

// Predefined mapping for common website names and search URLs
const websiteMappings = {
  youtube: "https://www.youtube.com/results?search_query=",
  google: "https://www.google.com/search?q=",
  facebook: "https://www.facebook.com/search/top?q=",
  twitter: "https://twitter.com/search?q=",
  github: "https://github.com/search?q=",
  maps: "https://www.google.com/maps",
};

// Function to convert text to speech
function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

// Function to handle recognized commands
function handleCommand(command) {

  let mathCommand = command;
  if (command.startsWith("what is ")) {
    mathCommand = command.replace("what is ", "");
  } else if (command.startsWith("calculate ")) {
    mathCommand = command.replace("calculate ", "");
  }
  
  const mathPattern = /(\d+)\s*(plus|minus|times|multiplied by|divided by|over)\s*(\d+)/;
  const mathMatch = command.match(mathPattern);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    const operator = mathMatch[2];
    const num2 = parseFloat(mathMatch[3]);
    let result;

    switch (operator) {
      case "plus":
        result = num1 + num2;
        break;
      case "minus":
        result = num1 - num2;
        break;
      case "times":
      case "multiplied by":
        result = num1 * num2;
        break;
      case "divided by":
      case "over":
        result = num2 === 0 ? "undefined (cannot divide by zero)" : num1 / num2;
        break;
    }

    speak(`The answer is ${result}`);
    return;
  }
  if (command.startsWith("play ")) {
    const song = command.replace("play ", "").trim();
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(song)}`;
    speak(`Playing ${song} on YouTube`);
    window.open(url, "_blank");
    return;
  }
  
  if (command.includes("time")) {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    speak(`The time is ${time}`);
    return;
  }
  
  if (command.includes("date")) {
    const now = new Date();
    const date = now.toDateString();
    speak(`Today is ${date}`);
    return;
  }

  // Casual chatting
for (const phrase in casualTalk) {
  if (command.includes(phrase)) {
    speak(casualTalk[phrase]);
    return;
  }
}

  if (command.startsWith("translate ")) {
    const parts = command.replace("translate ", "").split(" to ");
    if (parts.length === 2) {
      const text = parts[0].trim();
      const targetLang = parts[1].trim().toLowerCase();
  
      const langCodes = {
        spanish: "es",
        french: "fr",
        german: "de",
        italian: "it",
        hindi: "hi",
        chinese: "zh",
        arabic: "ar",
        russian: "ru",
        japanese: "ja",
        portuguese: "pt",
        korean: "ko"
      };
  
      const targetCode = langCodes[targetLang];
      if (!targetCode) {
        speak(`Sorry, I can't translate to ${targetLang} yet.`);
        return;
      }
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetCode}`;
      fetch(url)
      .then(res => res.json())
      .then(data => {
        const translatedText = data.responseData.translatedText;
        speak(`The translation in ${targetLang} is: ${translatedText}`);
      })
      .catch(err => {
        console.error(err);
        speak("Sorry, I couldn't translate that right now.");
      });

  } else {
    speak("Please say it like: Translate hello to Spanish.");
  }
  return;
}

  

  if (command.includes("weather")) {
    getWeather();
    return;
  }

  if (command.includes("news")) {
    getNews();
    return;
  }

  if (command.startsWith("open ")) {
    const rest = command.replace("open ", "").trim().toLowerCase();
    const [website, ...queryParts] = rest.split(" and search for ");
    const cleanWebsite = website.trim().replace(/[^\w]/g, "");
    const query = queryParts.join(" ").trim();

    let urlToOpen = "";

    if (websiteMappings[cleanWebsite]) {
      if (query) {
        urlToOpen = `${websiteMappings[cleanWebsite]}${encodeURIComponent(query)}`;
        speak(`Searching ${query} on ${cleanWebsite}...`);
      } else {
        urlToOpen = websiteMappings[cleanWebsite].split("?")[0];
        speak(`Opening ${cleanWebsite}...`);
      }
    } else if (query) {
      // If user says something like "open xyz and search for dogs"
      speak(`Searching ${query} on ${cleanWebsite}...`);
      urlToOpen = `https://${cleanWebsite}.com/search?q=${encodeURIComponent(query)}`;
    } else {
      // Try to open the website directly (e.g., open flipkart)
      speak(`Opening ${cleanWebsite}...`);
      urlToOpen = `https://${cleanWebsite}.com`;
    }

    window.open(urlToOpen, "_blank");
  } else {
    speak("Searching Google for " + command);
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(command)}`,
      "_blank"
    );
  }
}


// Button click event listener
btn.addEventListener("click", function () {
  // Greet the user and then start listening
  speak("Hello, how can I help you?");
  
  // Delay to ensure greeting completes before starting recognition
  setTimeout(() => {
    btn.innerHTML = "Listening...👂";
    btn.classList.add("listening");
    container.classList.add("glow");
    btnVideo.style.display = "block";
    recognition.start();
  }, 2500);

  // When a result is received
  recognition.onresult = (event) => {
    console.log(event);
    const command = event.results[0][0].transcript.toLowerCase().replace(/[.,!?]$/, "");
    handleCommand(command);
  };

  // When recognition ends
  recognition.onend = () => {
    btn.innerHTML = "Start Listening";
    btn.classList.remove("listening");
    container.classList.remove("glow");
    btnVideo.style.display = "none";
  };
});
function getWeather() {
  if (!navigator.geolocation) {
    speak("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=metric`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const city = data.name;
      const temp = data.main.temp;
      const desc = data.weather[0].description;

      const weatherInfo = `It is currently ${temp}°C with ${desc} in ${city}.`;
      speak(weatherInfo);
    } catch (err) {
      console.error(err);
      speak("Sorry, I couldn't fetch the weather.");
    }
  });
}

async function getNews() {
  const url = `https://newsapi.org/v2/top-headlines?country=in&apiKey=${newsApiKey}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const headlines = data.articles.slice(0, 3).map((article, i) => `Headline ${i + 1}: ${article.title}`);
    const news = headlines.join(". ");
    speak("Here are the top headlines. " + news);
  } catch (err) {
    console.error(err);
    speak("Sorry, I couldn't fetch the news.");
  }
}
