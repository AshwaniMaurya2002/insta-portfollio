import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

/* ================================
   SNAKE GAME
================================ */

function SnakeGame() {
  const canvasRef = useRef(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("snakeHighScore")) || 0,
  );
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const gameRef = useRef(null);

  const GRID = 40;
  const CELL = 20;
  const CANVAS_SIZE = GRID * CELL;

  const startGame = () => {
    setScore(0);
    setGameStarted(true);
    setGameOver(false);

    gameRef.current = {
      snake: [{ x: 15, y: 15 }],

      food: {
        x: 22,
        y: 15,
      },

      growth: 0,

      direction: {
        x: 1,
        y: 0,
      },

      nextDirection: {
        x: 1,
        y: 0,
      },

      running: true,
    };
  };

  const createFood = (snake) => {
    let food;

    do {
      food = {
        x: Math.floor(Math.random() * GRID),
        y: Math.floor(Math.random() * GRID),
      };
    } while (snake.some((part) => part.x === food.x && part.y === food.y));

    return food;
  };

  /* ================================
     KEYBOARD CONTROLS
  ================================= */

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const handleKeyDown = (e) => {
      const game = gameRef.current;

      if (!game) return;

      const key = e.key.toLowerCase();

      if ((key === "arrowup" || key === "w") && game.direction.y !== 1) {
        game.nextDirection = {
          x: 0,
          y: -1,
        };
      }

      if ((key === "arrowdown" || key === "s") && game.direction.y !== -1) {
        game.nextDirection = {
          x: 0,
          y: 1,
        };
      }

      if ((key === "arrowleft" || key === "a") && game.direction.x !== 1) {
        game.nextDirection = {
          x: -1,
          y: 0,
        };
      }

      if ((key === "arrowright" || key === "d") && game.direction.x !== -1) {
        game.nextDirection = {
          x: 1,
          y: 0,
        };
      }

      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gameStarted, gameOver]);

  /* ================================
     GAME LOOP
  ================================= */

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const draw = () => {
      const game = gameRef.current;

      if (!game) return;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      /* Grid */

      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 1;

      for (let i = 0; i <= GRID; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL, 0);
        ctx.lineTo(i * CELL, CANVAS_SIZE);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * CELL);
        ctx.lineTo(CANVAS_SIZE, i * CELL);
        ctx.stroke();
      }

      /* Food */

      ctx.font = "18px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";

      ctx.fillText(
        "✦",
        game.food.x * CELL + CELL / 2,
        game.food.y * CELL + CELL / 2,
      );

      /* Snake */

      game.snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#ffffff" : "rgba(255,255,255,0.55)";

        const padding = 2;

        ctx.beginPath();

        ctx.roundRect(
          part.x * CELL + padding,
          part.y * CELL + padding,
          CELL - padding * 2,
          CELL - padding * 2,
          5,
        );

        ctx.fill();
      });
    };

    const endGame = () => {
      const game = gameRef.current;

      if (!game) return;

      game.running = false;

      setGameOver(true);
      setGameStarted(false);
    };

    const update = () => {
      const game = gameRef.current;

      if (!game || !game.running) return;

      game.direction = game.nextDirection;

      const head = {
        ...game.snake[0],
      };

      head.x += game.direction.x;
      head.y += game.direction.y;

      /* Endless / wrap-around borders */

      if (head.x < 0) {
        head.x = GRID - 1;
      }

      if (head.x >= GRID) {
        head.x = 0;
      }

      if (head.y < 0) {
        head.y = GRID - 1;
      }

      if (head.y >= GRID) {
        head.y = 0;
      }

      /* Snake collision */

      if (game.snake.some((part) => part.x === head.x && part.y === head.y)) {
        endGame();
        return;
      }

      game.snake.unshift(head);

      /* Food collision */

      if (head.x === game.food.x && head.y === game.food.y) {
        const newScore = score + 10;

        setScore(newScore);

        if (newScore > highScore) {
          setHighScore(newScore);

          localStorage.setItem("snakeHighScore", newScore.toString());
        }

        game.growth += 2;

        game.food = createFood(game.snake);
      }

      /* Handle growth */

      if (game.growth > 0) {
        game.growth--;
      } else {
        game.snake.pop();
      }

      draw();
    };

    const interval = setInterval(update, 120);

    draw();

    return () => {
      clearInterval(interval);
    };
  }, [gameStarted, gameOver, score, highScore]);

  /* ================================
     MOBILE CONTROLS
  ================================= */

  const changeDirection = (direction) => {
    const game = gameRef.current;

    if (!game) return;

    if (direction === "up" && game.direction.y !== 1) {
      game.nextDirection = {
        x: 0,
        y: -1,
      };
    }

    if (direction === "down" && game.direction.y !== -1) {
      game.nextDirection = {
        x: 0,
        y: 1,
      };
    }

    if (direction === "left" && game.direction.x !== 1) {
      game.nextDirection = {
        x: -1,
        y: 0,
      };
    }

    if (direction === "right" && game.direction.x !== -1) {
      game.nextDirection = {
        x: 1,
        y: 0,
      };
    }
  };

  return (
    <section className="game-section" id="playground">
      <div className="section-label">
        <span>03</span>
        PLAYGROUND
      </div>

      <div className="game-header">
        <div>
          <span className="game-small">TAKE A BREAK FROM CODING 🎮</span>

          <h2>
            CODE <span>SNAKE.</span>
          </h2>

          <p>Eat the code. Avoid the bugs. Beat the high score.</p>
        </div>

        <div className="game-score">
          <div>
            <span>SCORE</span>
            <strong>{score}</strong>
          </div>

          <div>
            <span>BEST</span>
            <strong>{highScore}</strong>
          </div>
        </div>
      </div>

      <div className="snake-game">
        <div className="game-screen">
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />

          {!gameStarted && (
            <div className="game-overlay">
              {gameOver ? (
                <>
                  <span className="game-over-text">GAME OVER</span>

                  <p>
                    Score: <strong>{score}</strong>
                  </p>

                  <button onClick={startGame} className="game-button">
                    Play Again ↗
                  </button>
                </>
              ) : (
                <>
                  <span className="game-icon">🐍</span>

                  <h3>CODE SNAKE</h3>

                  <p>
                    Use <strong>WASD</strong> or <strong>Arrow Keys</strong>
                  </p>

                  <button onClick={startGame} className="game-button">
                    Start Game ↗
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="mobile-controls">
          <button onClick={() => changeDirection("up")}>↑</button>

          <div>
            <button onClick={() => changeDirection("left")}>←</button>

            <button onClick={() => changeDirection("down")}>↓</button>

            <button onClick={() => changeDirection("right")}>→</button>
          </div>
        </div>

        <div className="game-footer">
          <span>WASD / ARROWS TO MOVE</span>
          <span>FOOD = +2 GROWTH</span>
          <span>HIGH SCORE SAVED LOCALLY</span>
        </div>
      </div>
    </section>
  );
}

/* ================================
   MAIN APP
================================ */

function App() {
  const roles = [
    "Full-Stack Developer",
    "React Developer",
    "Java Developer",
    "Vibe Coder",
    "Problem Solver",
  ];

  const [roleIndex, setRoleIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const currentRole = roles[roleIndex];

    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setDisplayText(currentRole.substring(0, displayText.length + 1));

          if (displayText.length === currentRole.length) {
            setTimeout(() => setDeleting(true), 1200);
          }
        } else {
          setDisplayText(currentRole.substring(0, displayText.length - 1));

          if (displayText.length === 0) {
            setDeleting(false);

            setRoleIndex((prev) => (prev + 1) % roles.length);
          }
        }
      },
      deleting ? 45 : 85,
    );

    return () => clearTimeout(timeout);
  }, [displayText, deleting, roleIndex]);

  return (
    <main>
      <div className="background">
        <div className="orb orb-one"></div>
        <div className="orb orb-two"></div>
        <div className="orb orb-three"></div>
        <div className="grid"></div>
      </div>

      <nav className="navbar">
        <a href="#home" className="brand">
          AK<span>.</span>
        </a>

        <div className="nav-right">
          <a href="#about">About</a>
          <a href="#stack">Stack</a>
          <a href="#playground">Play</a>
          <a href="#connect">Connect</a>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-left">
          <div className="availability">
            <span></span>
            Currently building & learning
          </div>

          <p className="hello">Hey, I'm</p>

          <h1>
            Ashwani
            <br />
            <span>Kumar Maurya</span>
          </h1>

          <div className="role">
            <span>{displayText}</span>
            <b>|</b>
          </div>

          <p className="intro">
            I turn ideas into interfaces, bugs into features and caffeine into
            commits.
          </p>

          <div className="vibe-line">
            <span>✦</span>
            Currently in my <strong>build era.</strong>
          </div>

          <div className="buttons">
            <a href="#about" className="main-button">
              Enter the chaos
              <span>↗</span>
            </a>

            <a href="#connect" className="outline-button">
              Let's build
            </a>
          </div>

          <div className="social-row">
            <a
              href="https://github.com/AshwaniMaurya2002"
              target="_blank"
              rel="noreferrer"
            >
              <span>GH</span>
              GitHub
            </a>

            <a
              href="https://www.linkedin.com/in/ashwani-kumar-maurya/"
              target="_blank"
              rel="noreferrer"
            >
              <span>in</span>
              LinkedIn
            </a>

            <a href="https://instagram.com/" target="_blank" rel="noreferrer">
              <span>◎</span>
              Instagram
            </a>
          </div>
        </div>

        <div className="profile-area">
          <div className="profile-card">
            <div className="card-glow"></div>

            <div className="profile-top">
              <span>BUILD MODE</span>
              <span>2026</span>
            </div>

            <div className="avatar">
              <img src="/profile.jpg" alt="Ashwani Kumar Maurya" />

              <div className="avatar-ring"></div>
            </div>

            <h2>Ashwani</h2>

            <p>Code. Create. Ship. Repeat.</p>

            <div className="status-pill">
              <span></span>
              100% in build mode
            </div>

            <div className="mini-stats">
              <div>
                <strong>∞</strong>
                <span>Ideas</span>
              </div>

              <div>
                <strong>24</strong>
                <span>Years</span>
              </div>

              <div>
                <strong>01</strong>
                <span>Mission</span>
              </div>
            </div>

            <div className="card-footer">
              <span>INDIA 🇮🇳</span>
              <span>⌁ VIBE CODER</span>
            </div>
          </div>

          <div className="floating-tag tag-one">⚡ Java</div>

          <div className="floating-tag tag-two">⚛ React</div>

          <div className="floating-tag tag-three">☕ Spring</div>

          <div className="floating-tag tag-four">✦ Ship it</div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="section-label">
          <span>01</span>
          WHO AM I?
        </div>

        <div className="about-content">
          <h2>
            Not just coding.
            <br />
            <span>I'm building my own lane.</span>
          </h2>

          <p>
            I'm a Computer Science graduate who turns random ideas into real,
            working products. My playground is Java, Spring Boot, React, and
            modern web development.
          </p>

          <p>
            I'm obsessed with clean UI, smooth interactions, and building things
            that feel good to use. Basically: think it → build it → break it →
            fix it → ship it.
          </p>

          <div className="quote-box">
            <span>“</span>

            <p>
              Ship first. Perfect later.
              <br />
              That's the vibe.
            </p>
          </div>
        </div>
      </section>

      <section className="skills" id="stack">
        <div className="section-label">
          <span>02</span>
          MY DIGITAL WEAPONS
        </div>

        <div className="skill-cloud">
          <span>Java</span>
          <span>Spring Boot</span>
          <span>React</span>
          <span>JavaScript</span>
          <span>HTML</span>
          <span>CSS</span>
          <span>MySQL</span>
          <span>Hibernate</span>
          <span>JPA</span>
          <span>REST APIs</span>
          <span>Git</span>
          <span>GitHub</span>
          <span>Postman</span>
          <span>DSA</span>
          <span>OOP</span>
        </div>

        <div className="stack-caption">
          <span>Currently learning →</span>
          <strong>Spring Boot. React. Building. Shipping.</strong>
        </div>
      </section>

      <section className="vibe-section">
        <div className="vibe-card">
          <span className="vibe-small">DEVELOPER THOUGHTS.exe</span>

          <h2>
            Ideas → Code
            <br />→ Chaos →<span>Shipped.</span>
          </h2>

          <p>
            Sometimes I know exactly what I'm doing. Sometimes I just keep
            pressing Run.
          </p>

          <div className="terminal">
            <div className="terminal-top">
              <span>●</span>
              <span>●</span>
              <span>●</span>
              <small>ashwani@dev ~</small>
            </div>

            <div className="terminal-body">
              <p>
                <span>$</span> npm run build
              </p>

              <p className="success">✓ Compiled successfully</p>

              <p>
                <span>$</span> git commit -m "trust the process"
              </p>

              <p className="success">✓ shipped 🚀</p>
            </div>
          </div>
        </div>
      </section>

      <SnakeGame />

      <section className="connect" id="connect">
        <div className="section-label">
          <span>04</span>
          LET'S TALK
        </div>

        <div className="contact-header">
          <div>
            <h2>
              Got an idea?
              <br />
              <span>Let's make it real.</span>
            </h2>

            <p>
              Opportunity, collaboration, random tech idea or just a "bro, check
              this out" message — I'm here.
            </p>
          </div>

          <div className="contact-badge">
            <span></span>
            Open to messages
          </div>
        </div>

        <form
          action="https://api.web3forms.com/submit"
          method="POST"
          className="contact-form"
        >
          <input
            type="hidden"
            name="access_key"
            value={import.meta.env.VITE_W3FORMS_ACCESS_KEY}
          />

          <input
            type="hidden"
            name="subject"
            value="New message from Ashwani's Portfolio"
          />

          <input type="hidden" name="from_name" value="Ashwani Portfolio" />

          <div className="form-row">
            <div className="input-group">
              <label>Your name</label>

              <input type="text" name="name" placeholder="John Doe" required />
            </div>

            <div className="input-group">
              <label>Your email</label>

              <input
                type="email"
                name="email"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>What's on your mind?</label>

            <textarea
              name="message"
              rows="6"
              placeholder="Hey Ashwani, I have an interesting opportunity..."
              required
            ></textarea>
          </div>

          <input
            type="checkbox"
            name="botcheck"
            className="hidden"
            style={{
              display: "none",
            }}
          />

          <button type="submit" className="send-button">
            Send message
            <span>↗</span>
          </button>
        </form>

        <div className="contact-bottom">
          <span>Usually replies within 24–48 hrs</span>

          <div className="big-socials">
            <a
              href="https://github.com/AshwaniMaurya2002"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
              <span>↗</span>
            </a>

            <a
              href="https://www.linkedin.com/in/ashwani-kumar-maurya/"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
              <span>↗</span>
            </a>

            <a href="https://instagram.com/" target="_blank" rel="noreferrer">
              Instagram
              <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <span>ASHWANI KUMAR MAURYA</span>
        <span>BUILT WITH REACT ⚡ & GOOD VIBES</span>
        <span>© 2026</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
