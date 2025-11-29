import React, { useState } from "react";
import "./App.css";

// 🔑 SheCodes Dictionary API Key
const DICTIONARY_API_KEY = "cf40cbba3b587f08e75d70b82t7ad6ff";

// 🔑 Pexels API Key (für Bilder)
const PEXELS_API_KEY =
  "cXKgQL3uxxsgo3AmDiYe9AzVLWOvKKg3tR5GwuFqMnSGm9kzWT12fNpc";

export default function App() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  async function search(event) {
    event.preventDefault();
    const query = keyword.trim();
    if (!query) return;

    const dictionaryUrl = `https://api.shecodes.io/dictionary/v1/define?word=${encodeURIComponent(
      query
    )}&key=${DICTIONARY_API_KEY}`;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setPhotos([]);

    try {
      // 📚 Dictionary Daten holen
      const dictResponse = await fetch(dictionaryUrl);
      const dictData = await dictResponse.json();
      console.log("Dictionary response:", dictData);

      if (!dictResponse.ok || !dictData || !dictData.word) {
        throw new Error("No definition from API");
      }

      setResults(dictData);

      // 🖼 Bilder nur laden, wenn Pexels-Key vorhanden ist
      if (PEXELS_API_KEY && !PEXELS_API_KEY.startsWith("YOUR_")) {
        const photosUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          query
        )}&per_page=9`;

        const photosResponse = await fetch(photosUrl, {
          headers: { Authorization: PEXELS_API_KEY },
        });

        if (photosResponse.ok) {
          const photosData = await photosResponse.json();
          setPhotos((photosData.photos || []).slice(0, 9)); // max. 9 Bilder
        }
      }
    } catch (err) {
      console.error(err);
      setError("No definition found. Please try another word.");
    } finally {
      setIsLoading(false);
    }
  }

  // 🔊 Phonetik & Audio
  const phoneticText =
    results?.phonetic ||
    (results?.phonetics && results.phonetics[0]?.text) ||
    "";

  const audioUrl =
    results?.audio ||
    (results?.phonetics &&
      results.phonetics.find((p) => p.audio && p.audio.length > 0)?.audio) ||
    "";

  function playAudio() {
    if (audioUrl) {
      const sound = new Audio(audioUrl);
      sound.play();
    }
  }

  // Alle Meanings (noun, verb, adjective …)
  const meanings = results?.meanings || [];

  // Hilfsfunktion: 1 Meaning pro Wortart (noun / adjective / verb)
  function findMeaningByPos(keyword) {
    return meanings.find(
      (m) =>
        m.partOfSpeech &&
        m.partOfSpeech.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  const nounMeaning = findMeaningByPos("noun");
  const adjMeaning = findMeaningByPos("adjective");
  const verbMeaning = findMeaningByPos("verb");

  // Hilfsfunktion: aus einem Meaning die 1. Definition + Synonyme holen
  function getFirstDefinitionBlock(meaning) {
    if (!meaning) return null;

    let def = null;
    // Format A: definitions[0].definition
    if (Array.isArray(meaning.definitions) && meaning.definitions.length > 0) {
      def = meaning.definitions[0];
    }
    // Format B: meaning.definition direkt
    else if (meaning.definition) {
      def = {
        definition: meaning.definition,
        example: meaning.example,
        synonyms: meaning.synonyms,
      };
    }

    if (!def || !def.definition) return null;

    const syns = Array.from(
      new Set([...(def.synonyms || []), ...(meaning.synonyms || [])])
    );

    return { def, syns };
  }

  // Icon für Wortarten
  function getPosIconClass(pos = "") {
    const lower = pos.toLowerCase();
    if (lower.includes("noun")) return "fas fa-book-open";
    if (lower.includes("verb")) return "fas fa-bolt";
    if (lower.includes("adjective")) return "fas fa-palette";
    if (lower.includes("adverb")) return "fas fa-feather-alt";
    return "fas fa-circle";
  }

  // UI-Baustein: eine Section (Wortart) rendern
  function renderMeaningSection(label, meaning) {
    if (!meaning) return null;
    const block = getFirstDefinitionBlock(meaning);
    if (!block) return null;

    const { def, syns } = block;

    return (
      <section className="dictionary-section card-strong mb-4" key={label}>
        <div className="d-flex align-items-center mb-3">
          <span className="part-of-speech-badge">
            <i
              className={`pos-icon ${getPosIconClass(meaning.partOfSpeech)}`}
            ></i>
            {meaning.partOfSpeech}
          </span>
        </div>

        <div className="definition-card">
          <p className="definition-text">{def.definition}</p>

          {def.example && <p className="example-text">"{def.example}"</p>}

          {syns.length > 0 && (
            <div className="synonyms-wrapper">
              <h4 className="synonyms-title">Synonyms</h4>
              <div className="synonyms-list">
                {syns.map((syn) => (
                  <span className="synonym-badge" key={syn}>
                    {syn}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <div className="App container py-5">
      {/* Header */}
      <header className="app-header d-flex align-items-center mb-4">
        <div className="app-logo me-3">
          <i className="fas fa-book-open"></i>
        </div>
        <div>
          <h1 className="app-title mb-0">Dictionary</h1>
          <p className="app-subtitle mb-0">
            Search for meanings, examples, synonyms and related images.
          </p>
        </div>
      </header>

      {/* Such-Section */}
      <section className="dictionary-section card-strong mb-4">
        <h2 className="section-title mb-3">What do you want to look up?</h2>

        <form className="search-form" onSubmit={search}>
          <div className="input-group search-input-group">
            <input
              type="search"
              placeholder="For example: love, code, sunset…"
              className="form-control search-input"
              onChange={(event) => setKeyword(event.target.value)}
            />
            <button type="submit" className="btn search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          <p className="search-hint mb-0">
            For example try searching for: <span>sun</span>, <span>love</span>,{" "}
            <span>code</span>, <span>coding</span>…
          </p>
        </form>
      </section>

      {/* Fehler */}
      {error && (
        <section className="dictionary-section card-strong mb-4">
          <div className="alert alert-warning mb-0" role="alert">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        </section>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="loading-wrapper text-center my-5">
          <div className="spinner-border text-success mb-2" role="status" />
          <p className="text-muted mb-0">Loading…</p>
        </div>
      )}

      {/* Ergebnisse */}
      {!isLoading && results && (
        <>
          {/* Wort + Phonetik + Audio */}
          <section className="dictionary-section card-strong mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="word-title mb-1">{results.word}</h2>
                {phoneticText && (
                  <p className="word-phonetic mb-0">{phoneticText}</p>
                )}
              </div>

              {audioUrl && (
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

          {/* Geordnete Sections: Noun → Adjective → Verb */}
          {renderMeaningSection("noun", nounMeaning)}
          {renderMeaningSection("adjective", adjMeaning)}
          {renderMeaningSection("verb", verbMeaning)}

          {/* Bilder ganz am Ende */}
          {photos.length > 0 && (
            <section className="dictionary-section card-strong mb-4 photos-section">
              <h3 className="section-subtitle mb-3">
                <i className="fas fa-image me-2"></i>
                Related images
              </h3>
              <div className="photos-grid">
                {photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={photo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="photo-card"
                  >
                    <img
                      src={photo.src.medium}
                      alt={photo.alt}
                      className="photo-image"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
