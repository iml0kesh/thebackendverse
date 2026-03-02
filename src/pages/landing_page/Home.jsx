import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { TOPICS, CATEGORIES } from "./homeTopics";

export const Home = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const filtered = TOPICS.filter(
    (t) => activeCategory === "All" || t.tag === activeCategory,
  );

  const getRouteForTopic = (id) => {
    const routeMap = {
      url: "/url",
      cdn: "/cdn",
    };
    return routeMap[id] || "/";
  };

  return (
    <div className="home-page">
      <section className={`home-hero ${visible ? "hero-visible" : ""}`}>
        <div className="home-eyebrow">
          <span className="eyebrow-dot" />
          Learn what runs under the hood
        </div>
        <h1 className="home-title">
          Every backend question
          <br />
          <span className="home-title-accent">you were afraid to ask</span>
        </h1>
        <p className="home-subtitle">
          Interactive, animated explanations of how things actually work — from
          DNS to databases, CDNs to compilers. No fluff. Just clarity.
        </p>
        <div className="home-hero-actions">
          <button className="home-cta-btn" onClick={() => navigate("/url")}>
            Start with URL Journey →
          </button>
          <div className="home-hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">9</span>
              <span className="hero-stat-label">Topics</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">5</span>
              <span className="hero-stat-label">Categories</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-num">100%</span>
              <span className="hero-stat-label">Free</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-topics">
        <div className="home-topics-header">
          <h2 className="home-section-title">Explore Topics</h2>
          <p className="home-topics-count">{filtered.length} topics</p>
        </div>
        <div className="home-filter-tabs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`home-filter-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="home-topic-grid">
          {filtered.map((topic, i) => (
            <div
              key={topic.id}
              className={`home-topic-card ${!topic.available ? "coming-soon" : ""} ${i === 0 && activeCategory === "All" ? "featured" : ""}`}
              onClick={() =>
                topic.available && navigate(getRouteForTopic(topic.id))
              }
              style={{ cursor: topic.available ? "pointer" : "default" }}
            >
              {!topic.available && (
                <span className="coming-badge">coming soon</span>
              )}
              <div className="topic-card-top">
                <span className="topic-card-icon">{topic.icon}</span>
                <span
                  className="topic-card-tag"
                  style={{
                    color: topic.tagColor,
                    borderColor: `${topic.tagColor}40`,
                    background: `${topic.tagColor}12`,
                  }}
                >
                  {topic.tag}
                </span>
              </div>
              <h3 className="topic-card-title">{topic.title}</h3>
              <p className="topic-card-desc">{topic.desc}</p>
              <div className="topic-card-footer">
                <span className="topic-card-meta">
                  {topic.steps} stages · {topic.time}
                </span>
                {topic.available && <span className="topic-card-arrow">→</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="home-how">
        <div
          style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}
        >
          <h2 className="home-section-title">How it works</h2>
          <div className="home-how-grid">
            {[
              {
                num: "01",
                title: "Pick a question",
                desc: "Every topic is a real question developers actually ask. No artificial structure — just things you genuinely want to understand.",
              },
              {
                num: "02",
                title: "Watch it animate",
                desc: "Each topic has an animated pipeline showing the full journey step by step. Pause anywhere, or jump to what you care about.",
              },
              {
                num: "03",
                title: "Go as deep as you want",
                desc: "Click any step for a deep dive — plain-English summary, technical details, real code, and CLI commands you can run yourself.",
              },
            ].map(({ num, title, desc }) => (
              <div key={num} className="home-how-card">
                <span className="home-how-num">{num} /</span>
                <h4 className="home-how-title">{title}</h4>
                <p className="home-how-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="home-cta">
        <div className="home-cta-inner">
          <div>
            <h2 className="home-cta-title">
              Stop being confused.
              <br />
              <span className="home-title-accent">Start seeing clearly.</span>
            </h2>
            <p className="home-cta-sub">
              Start with the URL Journey — the most fundamental question in web
              development.
            </p>
          </div>
          <div className="home-cta-right">
            <button className="home-cta-btn" onClick={() => navigate("/url")}>
              Start URL Journey →
            </button>
            <p className="home-cta-note">No account needed · 100% free</p>
          </div>
        </div>
      </section>
    </div>
  );
};
