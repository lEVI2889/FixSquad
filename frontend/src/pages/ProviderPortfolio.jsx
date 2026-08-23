/*
 * Integration placeholder for Rohan's Feature 6 component.
 * Keep this exact path and default export so his ProviderPortfolio.jsx can replace
 * this file without any router changes when feature/service-portfolio is merged.
 */
function ProviderPortfolio() {
  return (
    <section className="dashboard-page">
      <div className="container empty-state">
        <span className="empty-state__icon">✦</span>
        <p className="eyebrow"><span /> Provider tools</p>
        <h1>Service Portfolio Manager</h1>
        <p>Rohan’s portfolio component plugs into this route at the exact contracted file path.</p>
      </div>
    </section>
  );
}

export default ProviderPortfolio;
