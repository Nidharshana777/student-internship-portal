
import { useEffect, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '';

function InternshipList() {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/internships`)
      .then((response) => {
        if (!response.ok) throw new Error('Unable to load internships.');
        return response.json();
      })
      .then(setInternships)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="container">
      <section className="hero">
        <p className="eyebrow">YOUR CAREER STARTS HERE</p>
        <h1>Find Your Perfect Internship</h1>
        <p>
          Explore opportunities, build real-world skills, and take
          the first step toward your dream career.
        </p>
        <a href="#opportunities" className="primary-button">
          Explore Internships
        </a>
      </section>

      <section id="opportunities" className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">OPPORTUNITIES</p>
            <h2>Available Internships</h2>
          </div>
          <span className="count">{internships.length} positions</span>
        </div>

        {loading && <p className="status">Loading internships...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && internships.length === 0 && (
          <p>No internships are available right now.</p>
        )}

        <div className="internship-grid">
          {internships.map((internship) => (
            <article className="internship-card" key={internship.id}>
              <div className="card-top">
                <span className="company-icon">
                  {internship.company.charAt(0)}
                </span>
                <span className="tag">{internship.location}</span>
              </div>

              <h3>{internship.title}</h3>
              <p className="company">{internship.company}</p>
              <p className="description">{internship.description}</p>

              <div className="skills">
                {internship.skills.map((skill) => (
                  <span className="skill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="card-footer">
                <div>
                  <strong>{internship.stipend}</strong>
                  <p>{internship.duration}</p>
                </div>
                <Link
                  className="details-button"
                  to={`/internships/${internship.id}`}
                >
                  View Details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function InternshipDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setInternship(null);

    fetch(`${API_URL}/api/internships/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error('Internship not found.');
        return response.json();
      })
      .then(setInternship)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <main className="container status">Loading details...</main>;
  }

  if (error) {
    return (
      <main className="container">
        <p className="error">{error}</p>
        <Link to="/">← Back to internships</Link>
      </main>
    );
  }

  return (
    <main className="container details-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back to internships
      </button>

      <article className="details-card">
        <span className="tag">{internship.location}</span>
        <p className="eyebrow">{internship.company}</p>
        <h1>{internship.title}</h1>
        <p className="description">{internship.description}</p>

        <div className="detail-stats">
          <div>
            <span>Monthly stipend</span>
            <strong>{internship.stipend}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{internship.duration}</strong>
          </div>
        </div>

        <h3>Skills you'll work with</h3>
        <div className="skills">
          {internship.skills.map((skill) => (
            <span className="skill" key={skill}>
              {skill}
            </span>
          ))}
        </div>

        <button
          className="primary-button"
          onClick={() =>
            navigate('/apply', {
              state: { selectedInternship: internship.title },
            })
          }
        >
          Apply for this Internship
        </button>
      </article>
    </main>
  );
}

function ApplicationForm() {
  const location = useLocation();

  const [form, setForm] = useState({
    studentName: '',
    email: '',
    rollNumber: '',
    selectedInternship: location.state?.selectedInternship || '',
  });

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/internships`)
      .then((response) => {
        if (!response.ok) throw new Error('Could not load internships.');
        return response.json();
      })
      .then(setInternships)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setMessage('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (
      !form.studentName.trim() ||
      !form.email.trim() ||
      !form.rollNumber.trim() ||
      !form.selectedInternship
    ) {
      setError('Please complete all fields.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Application submission failed.');
      }

      setMessage(data.message || 'Application submitted successfully!');
      setForm({
        studentName: '',
        email: '',
        rollNumber: '',
        selectedInternship: '',
      });
    } catch (err) {
      setError(err.message || 'Unable to submit application.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="container form-page">
      <Link className="back-link" to="/">
        ← Back to internships
      </Link>

      <section className="form-card">
        <p className="eyebrow">TAKE THE NEXT STEP</p>
        <h1>Internship Application</h1>
        <p className="form-intro">
          Fill in your details to apply for an opportunity.
        </p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {loading ? (
          <p>Loading internships...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label htmlFor="studentName">Full Name</label>
            <input
              id="studentName"
              name="studentName"
              value={form.studentName}
              onChange={handleChange}
              placeholder="Enter your full name"
              minLength="2"
              required
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            <label htmlFor="rollNumber">Roll Number</label>
            <input
              id="rollNumber"
              name="rollNumber"
              value={form.rollNumber}
              onChange={handleChange}
              placeholder="Enter your roll number"
              required
            />

            <label htmlFor="selectedInternship">Select Internship</label>
            <select
              id="selectedInternship"
              name="selectedInternship"
              value={form.selectedInternship}
              onChange={handleChange}
              required
            >
              <option value="">Choose an internship</option>
              {internships.map((item) => (
                <option key={item.id} value={item.title}>
                  {item.title} — {item.company}
                </option>
              ))}
            </select>

            <button
              className="primary-button submit-button"
              type="submit"
              disabled={submitting || internships.length === 0}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}

function AppLayout() {
  return (
    <>
      <header className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">I</span>
          Intern<span>Connect</span>
        </Link>

        <nav>
          <Link to="/">Internships</Link>
          <Link to="/apply" className="nav-apply">
            Apply Now
          </Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<InternshipList />} />
        <Route path="/internships/:id" element={<InternshipDetails />} />
        <Route path="/apply" element={<ApplicationForm />} />
        <Route
          path="*"
          element={
            <main className="container">
              <h1>Page not found</h1>
              <Link to="/">Return home</Link>
            </main>
          }
        />
      </Routes>

      <footer className="footer">
        <p>InternConnect · Find opportunities. Build your future.</p>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
