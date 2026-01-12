import React from 'react';

function Services() {
  const services = [
    {
      title: 'Technology Consulting',
      description: 'Expert guidance to leverage technology for business growth',
      icon: '💡'
    },
    {
      title: 'Software Development',
      description: 'Custom software solutions tailored to your needs',
      icon: '💻'
    },
    {
      title: 'Digital Transformation',
      description: 'Transform your business with cutting-edge digital solutions',
      icon: '🚀'
    },
    {
      title: 'IT Solutions',
      description: 'Comprehensive IT infrastructure and support services',
      icon: '⚙️'
    }
  ];

  return (
    <div className="services-container">
      <h1>Our Services</h1>
      <p>Discover the range of innovative solutions we offer to help your business grow.</p>
      <div className="services-grid">
        {services.map((service, index) => (
          <div key={index} className="service-card">
            <div className="service-icon">{service.icon}</div>
            <h3>{service.title}</h3>
            <p>{service.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Services;
