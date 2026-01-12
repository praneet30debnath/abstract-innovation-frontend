import React from 'react';

function ContactUs() {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>
      <p>Get in touch with us for any inquiries or support.</p>
      <div className="contact-details">
        <h3>Abstract Innovation</h3>
        <p>Phone Numbers:</p>
        <div className="phone-list">
          <div className="phone-item">
            <a href="tel:+913346039929">+91 33 4603 9929</a>
          </div>
          <div className="phone-item">
            <a href="tel:+919830064192">+91 98300 64192</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
