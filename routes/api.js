
const express = require('express');
const router = express.Router();
const Application = require('../models/Application');

// Sample internships displayed by the portal
const internships = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'TechNova Solutions',
    location: 'Remote',
    duration: '3 Months',
    stipend: '₹10,000/month',
    description:
      'Build responsive user interfaces using HTML, CSS, JavaScript and React.',
    skills: ['HTML', 'CSS', 'JavaScript', 'React'],
  },
  {
    id: '2',
    title: 'Backend Developer Intern',
    company: 'CodeCraft Technologies',
    location: 'Chennai',
    duration: '6 Months',
    stipend: '₹12,000/month',
    description:
      'Develop REST APIs and backend services using Node.js, Express and MongoDB.',
    skills: ['Node.js', 'Express', 'MongoDB'],
  },
  {
    id: '3',
    title: 'Python Developer Intern',
    company: 'Innovate Labs',
    location: 'Hybrid',
    duration: '3 Months',
    stipend: '₹8,000/month',
    description:
      'Assist in developing Python applications and solving programming problems.',
    skills: ['Python', 'SQL', 'Problem Solving'],
  },
];

// GET: retrieve all internships
router.get('/internships', (req, res) => {
  res.status(200).json(internships);
});

// GET: retrieve one internship by ID
router.get('/internships/:id', (req, res) => {
  const internship = internships.find(
    (item) => item.id === req.params.id
  );

  if (!internship) {
    return res.status(404).json({
      message: 'Internship not found',
    });
  }

  res.status(200).json(internship);
});

// POST: submit a student application
router.post('/applications', async (req, res) => {
  try {
    const { studentName, email, rollNumber, selectedInternship } =
      req.body;

    if (
      !studentName?.trim() ||
      !email?.trim() ||
      !rollNumber?.trim() ||
      !selectedInternship?.trim()
    ) {
      return res.status(400).json({
        message: 'Please fill in all required fields.',
      });
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!validEmail.test(email.trim())) {
      return res.status(400).json({
        message: 'Please enter a valid email address.',
      });
    }

    const internshipExists = internships.some(
      (item) => item.title === selectedInternship.trim()
    );

    if (!internshipExists) {
      return res.status(400).json({
        message: 'Please select a valid internship.',
      });
    }

    const application = await Application.create({
      studentName: studentName.trim(),
      email: email.trim(),
      rollNumber: rollNumber.trim(),
      selectedInternship: selectedInternship.trim(),
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    console.error('Application submission error:', error);

    res.status(500).json({
      message: 'Unable to submit your application. Please try again.',
    });
  }
});

// GET: retrieve submitted applications
router.get('/applications', async (req, res) => {
  try {
    const applications = await Application.find().sort({
      createdAt: -1,
    });

    res.status(200).json(applications);
  } catch (error) {
    console.error('Fetching applications error:', error);

    res.status(500).json({
      message: 'Unable to retrieve applications.',
    });
  }
});

module.exports = router;
