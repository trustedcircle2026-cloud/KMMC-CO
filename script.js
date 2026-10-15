(() => {
  // Use one consistent masthead and full navigation across every page.
  const sharedHeader = `
    <header class="site-header">
      <div class="container brand-row">
        <a class="brand" href="index.html" aria-label="K Mahesh Manickham and Co. Chartered Accountants home">
          <img class="brand-logo" src="assets/images/CA%20Logo.png" alt="K Mahesh Manickham and Co. Chartered Accountants">
          <span class="brand-copy"><strong>K Mahesh Manickham and Co.</strong><small>CHARTERED ACCOUNTANTS</small></span>
        </a>
        <div class="reference-enquiries"><span>Business Enquiries</span><div><a href="mailto:info@kmmc.co.in">info@kmmc.co.in</a><i></i><a href="tel:+919003060652">90030 60652</a><i></i><a href="careers.html">Careers</a></div></div>
        <a class="login-button" href="login.html">Login</a>
        <button class="menu-toggle" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
      </div>
    </header>`;
  const sharedNavigation = `
    <nav class="main-nav" aria-label="Main navigation">
      <div class="container nav-inner">
        <a class="nav-link" href="index.html">Home</a>
        <div class="nav-item"><a class="nav-link" href="service-audit.html">Audit</a><div class="dropdown"><a href="service-audit.html">Audit &amp; Assurance</a><a href="service-internal-audit.html">Internal Audit</a><a href="services.html">Tax Audit</a><a href="services.html">Statutory Audit</a></div></div>
        <div class="nav-item"><a class="nav-link" href="service-income-tax.html">Taxes</a><div class="dropdown"><a href="service-income-tax.html">Income Tax</a><a href="service-gst.html">GST Services</a><a href="service-tds.html">TDS Compliance</a></div></div>
        <div class="nav-item"><a class="nav-link" href="service-company-registration.html">Business Setup</a><div class="dropdown"><a href="service-company-registration.html">Company Registration</a><a href="service-llp.html">LLP Registration</a><a href="accountant.html">Dedicated Accounting Support</a></div></div>
        <div class="nav-item"><a class="nav-link" href="services.html">Registrations</a><div class="dropdown"><a href="service-gst.html">GST Registration</a><a href="service-pan-tan.html">PAN / TAN</a><a href="service-msme.html">MSME / Udyam</a></div></div>
        <div class="nav-item"><a class="nav-link" href="service-roc.html">MCA</a><div class="dropdown"><a href="service-roc.html">ROC Filings</a><a href="service-company-registration.html">Company Incorporation</a><a href="service-llp.html">LLP Compliance</a></div></div>
        <div class="nav-item"><a class="nav-link" href="services.html">Compliance</a><div class="dropdown"><a href="service-accounting.html">Accounting</a><a href="service-tds.html">Payroll &amp; TDS</a><a href="service-internal-audit.html">Internal Controls</a></div></div>
        <div class="nav-item"><a class="nav-link" href="about.html">Others</a><div class="dropdown"><a href="resources.html">Resources</a><a href="accountant.html">Accounting Professionals</a><a href="login.html">Portal Login</a><a href="client-portal.html">Client Portal</a></div></div>
        <div class="nav-item"><a class="nav-link" href="about.html">About</a><div class="dropdown"><a href="about.html">About the Firm</a><a href="about.html#approach">Our Approach</a></div></div>
        <a class="nav-link" href="resources.html">Blog</a>
        <div class="nav-item"><a class="nav-link" href="careers.html">Careers Opportunity</a><div class="dropdown"><a href="careers.html">Join K Mahesh Manickham and Co.</a><a href="accountant.html">Accounting Opportunities</a></div></div>
        <a class="nav-link" href="contact.html">Contact Us</a>
      </div>
    </nav>`;
  document.querySelectorAll(".announcement").forEach((bar) => bar.remove());
  const existingHeader = document.querySelector(".site-header");
  const existingNavigation = document.querySelector(".main-nav");
  if (existingHeader) existingHeader.outerHTML = sharedHeader;
  if (existingNavigation) existingNavigation.outerHTML = sharedNavigation;
  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const activeTargets = {
    "index.html":"Home","service-audit.html":"Audit","service-internal-audit.html":"Audit",
    "service-income-tax.html":"Taxes","service-gst.html":"Taxes","service-tds.html":"Taxes",
    "service-company-registration.html":"Business Setup","service-llp.html":"Business Setup","accountant.html":"Business Setup",
    "service-msme.html":"Registrations","service-pan-tan.html":"Registrations","service-roc.html":"MCA",
    "service-accounting.html":"Compliance","services.html":"Compliance","about.html":"About",
    "resources.html":"Blog","careers.html":"Careers Opportunity","contact.html":"Contact Us"
  };
  const activeLabel = activeTargets[currentFile];
  if (activeLabel) {
    document.querySelectorAll(".main-nav .nav-link").forEach((link) => {
      if (link.textContent.trim().replace("⌄","").trim() === activeLabel) link.classList.add("active");
    });
  }

  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".main-nav");

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      const isOpen = navigation.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    navigation.querySelectorAll(".nav-item > .nav-link").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (window.matchMedia("(max-width: 860px)").matches) {
          const parent = link.closest(".nav-item");
          if (parent && parent.querySelector(".dropdown")) {
            event.preventDefault();
            parent.classList.toggle("expanded");
          }
        }
      });
    });

    navigation.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        const isMobile = window.matchMedia("(max-width: 860px)").matches;
        if (isMobile && !link.closest(".nav-item")) {
          navigation.classList.remove("open");
          menuButton.setAttribute("aria-expanded", "false");
          menuButton.setAttribute("aria-label", "Open navigation");
        }
      });
    });
  }

  // Add consistent, working quick-contact actions to every page that loads this script.
  if (!document.querySelector(".floating-contact")) {
    const quickContact = document.createElement("div");
    quickContact.className = "floating-contact";
    quickContact.setAttribute("aria-label", "Quick contact");
    const whatsappMessage = "Hello KMMC, I would like to enquire about your Chartered Accountant services. Please assist me.";
    const whatsappUrl = "https://wa.me/919003060652?text=" + encodeURIComponent(whatsappMessage);
    quickContact.innerHTML = `
      <a class="float-whatsapp" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-label="Chat with KMMC on WhatsApp" title="WhatsApp">
        <svg viewBox="0 0 32 32" aria-hidden="true" width="25" height="25" fill="currentColor"><path d="M16 .8A15 15 0 0 0 3.1 23.5L1 31l7.7-2A15 15 0 1 0 16 .8Zm0 27.4a12.3 12.3 0 0 1-6.3-1.7l-.5-.3-4.6 1.2 1.2-4.5-.3-.5A12.4 12.4 0 1 1 16 28.2Zm6.8-9.3c-.4-.2-2.1-1-2.4-1.1-.3-.1-.6-.2-.8.2-.2.4-.9 1.1-1.1 1.3-.2.2-.4.3-.8.1-.4-.2-1.5-.6-2.9-1.8-1.1-1-1.8-2.1-2-2.5-.2-.4 0-.6.2-.8l.6-.7c.2-.2.2-.4.4-.6.1-.2.1-.5 0-.7-.1-.2-.8-1.9-1.1-2.6-.3-.7-.6-.6-.8-.6h-.7c-.2 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.6 1.5 3.8c.2.2 2.6 4 6.3 5.6.9.4 1.6.6 2.1.7.9.3 1.7.2 2.3.1.7-.1 2.1-.9 2.4-1.8.3-.9.3-1.6.2-1.8-.1-.2-.3-.3-.7-.5Z"/></svg>
      </a>
      <a class="float-phone" href="tel:+919003060652" aria-label="Call KMMC" title="Call us">☎</a>
      <a class="float-mail" href="mailto:info@kmmc.co.in" aria-label="Email KMMC" title="Email us">✉</a>`;
    document.body.appendChild(quickContact);
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const backToTop = document.querySelector(".back-top");
  const updateBackToTop = () => {
    if (backToTop) backToTop.classList.toggle("visible", window.scrollY > 450);
  };
  window.addEventListener("scroll", updateBackToTop, { passive: true });
  updateBackToTop();

  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  // Keep placeholder contact details visibly editable until official details are provided.
  document.querySelectorAll('a[href="#careers"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.hash = "contact";
    });
  });
})();