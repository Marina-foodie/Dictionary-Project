import React, { useState } from "react";
import "./App.css";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  async function search(event) {
    event.preventDefault();
    if (!keyword.trim()) return;

    const apiUrl = `https://api.dictionaryapi.dev/api/v2/entries/en/${keyword}`;

    try {
      setError(null);
      setResults(null);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error("Word not found");
      }

      const data = await response.json();
      setResults(data[0]);
    } catch (err) {
      console.error(err);
      setError("No definition found. Please try another word.");
    }
  }

  // Hilfsfunktionen für Phonetik & Audio
  const phonetic = results?.phonetics?.find((p) => p.text) || {};
  const audio = results?.phonetics?.find((p) => p.audio) || {};

  function playAudio() {
    if (audio.audio) {
      const sound = new Audio(audio.audio);
      sound.play();
    }
  }

  return (
    <div className="App container py-5">
      {/* Header */}
      <header className="app-header d-flex align-items-center mb-4">
        <div className="app-logo me-3">
          <i className="fas fa-book-open"></i>
        </div>
        <h1 className="app-title mb-0">Dictionary</h1>
      </header>

      {/* Such-Section */}
      <section className="dictionary-section shadow-sm mb-4">
        <h2 className="section-title mb-3">What do you want to look up?</h2>

        <form className="search-form" onSubmit={search}>
          <div className="input-group search-input-group">
            <input
              type="search"
              placeholder="Enter an English search term..."
              className="form-control search-input"
              onChange={(event) => setKeyword(event.target.value)}
            />
            <button type="submit" className="btn btn-primary search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <p className="search-hint mb-0">
            For example try searching for: <span>sun</span>, <span>love</span>,{" "}
            <span>code</span>, <span>coding</span>…
          </p>
        </form>
      </section>

      {/* Fehlermeldung */}
      {error && (
        <section className="dictionary-section shadow-sm mb-4">
          <div className="alert alert-warning mb-0" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </section>
      )}

      {/* Ergebnis-Section */}
      {results && (
        <>
          {/* Wort + Phonetik */}
          <section className="dictionary-section shadow-sm mb-4 word-section">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="word-title mb-1">{results.word}</h2>
                {phonetic.text && (
                  <p className="word-phonetic mb-0">{phonetic.text}</p>
                )}
              </div>

              {audio.audio && (
                <button
                  type="button"
                  className="icon-circle-button"
                  onClick={playAudio}
                  aria-label="Play pronunciation"
                >
                  <i className="fas fa-volume-up"></i>
                </button>
              )}
            </div>
          </section>

          {/* Bedeutungen */}
          {results.meanings.map((meaning, index) => (
            <section
              className="dictionary-section shadow-sm mb-4 meaning-section"
              key={index}
            >
              <span className="part-of-speech-badge">
                {meaning.partOfSpeech}
              </span>

              {meaning.definitions.map((definition, idx) => (
                <div className="definition-block" key={idx}>
                  <p className="definition-text">{definition.definition}</p>
                  {definition.example && (
                    <p className="example-text">"{definition.example}"</p>
                  )}
                </div>
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  );
}
