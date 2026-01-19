async function loadTestimonials() {
  try {
    const response = await fetch('data/testimonials.json');
    const data = await response.json();
    const container = document.getElementById('testimonials-container');

    if (!container) {
      console.error('Testimonials container not found');
      return;
    }

    data.testimonials.forEach(testimonial => {
      const div = document.createElement('div');
      div.className = 'testimonial';
      div.innerHTML = `
        <blockquote>
          <p>"${testimonial.text}"</p>
        </blockquote>
        <p class="testimonial-meta">
          <strong>${testimonial.name}</strong><br>
          ${testimonial.course}, ${testimonial.semester}
          <span class="rating">${'★'.repeat(testimonial.rating)}</span>
        </p>
      `;
      container.appendChild(div);
    });
  } catch (error) {
    console.error('Failed to load testimonials:', error);
    document.getElementById('testimonials-container').innerHTML =
      '<p>Testimonials temporarily unavailable.</p>';
  }
}

// Load testimonials when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadTestimonials);
} else {
  loadTestimonials();
}