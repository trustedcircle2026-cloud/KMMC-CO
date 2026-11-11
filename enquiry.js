/* Shared public enquiry handler for KMMC website. */
(() => {
  "use strict";
  const API_URL = "https://script.google.com/macros/s/AKfycbxRTYJgXaJ2z16YfYdYxJCey7IuGqEQzEK6Oa8DuMAh5B31nWgVU4xrxzwGJ-ngzTzo/exec";
  document.querySelectorAll('form.enquiry-form[data-backend="publicEnquiry"]').forEach(form => {
    if (form.dataset.connected === "1") return;
    form.dataset.connected = "1";
    const status = document.createElement("p");
    status.className = "form-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.hidden = true;
    form.append(status);
    form.addEventListener("submit", async event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const values = Object.fromEntries(new FormData(form).entries());
      const consent = form.querySelector('input[name="consent"]');
      const payload = {
        name: values.name || "",
        business: values.business || "",
        email: values.email || "",
        phone: values.phone || "",
        service: values.service || "General enquiry",
        message: values.message || "",
        interest: values.interest || "",
        resume: values.resume || "",
        consent: !!(consent && consent.checked),
        source: window.location.pathname
      };
      const button = form.querySelector('button[type="submit"],button:not([type])');
      const originalLabel = button ? button.textContent : "";
      if (button) { button.disabled = true; button.textContent = "Submitting…"; }
      status.hidden = false;
      status.className = "form-status";
      status.textContent = "Sending your enquiry…";
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ action: "publicEnquiry", record: payload })
        });
        const result = await response.json();
        if (!response.ok || !result || result.ok !== true) {
          throw new Error(result && result.error ? result.error : "The server could not accept this enquiry.");
        }
        status.className = "form-status success";
        const reference = result.data && result.data.reference;
        status.textContent = "Thank you. Your enquiry has been received." + (reference ? " Reference: " + reference : "") + " Our office will contact you.";
        const summary = document.getElementById("enquiry-summary");
        if (summary) { summary.textContent = status.textContent; summary.className = "notice form-status success"; summary.scrollIntoView({ behavior: "smooth", block: "nearest" }); }
        form.reset();
      } catch (error) {
        status.className = "form-status error";
        status.textContent = "We could not submit your enquiry. Please contact info@kmmc.co.in or call 90030 60652. " + String(error && error.message || "");
      } finally {
        if (button) { button.disabled = false; button.textContent = originalLabel; }
      }
    });
  });
})();