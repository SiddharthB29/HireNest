
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="navbar">
        <h2>HireNest</h2>

        <nav>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <button>Login</button>
        </nav>
      </header>

      <main className="hero" id="home">
        <div className="hero-content">
          <h1>
            Connecting Talent
            <br />
            With Opportunity.
          </h1>

          <p>
            HireNest simplifies campus placements by connecting
            students with companies through a smarter placement platform.
          </p>

          <div className="hero-buttons">
            <button>Find Opportunities</button>
            <button className="secondary-button">
              For Recruiters
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;