const form = document.getElementById("labelForm");
const steps = document.querySelectorAll(".step");
let currentStep = 0;

// Navigation buttons
document.querySelectorAll(".next").forEach(button => {
  button.addEventListener("click", () => {
    const currentInputs = steps[currentStep].querySelectorAll("input");
    let allSelected = true;

    // Check if at least one radio is selected
    const radios = Array.from(steps[currentStep].querySelectorAll("input[type='radio']"));
    if (!radios.some(r => r.checked)) {
      alert("Please select an option to continue.");
      return;
    }

    // Special handling for step 0: "Share or Email?"
    if (currentStep === 0) {
      const shareOrEmail = document.querySelector('input[name="share_or_email"]:checked').value;

      if (shareOrEmail === "email") {
        // Skip to last step
        steps[currentStep].classList.remove("active");
        currentStep = steps.length - 1;
        steps[currentStep].classList.add("active");
        return;
      } else {
        // "Share" selected → proceed to step 1
        currentStep++;
        steps[currentStep].classList.add("active");
        steps[currentStep - 1].classList.remove("active");
        return;
      }
    }

    // Special handling for step 1: Scope (Internal / External)
    if (currentStep === 1) {
      const scope = document.querySelector('input[name="scope"]:checked').value;

      if (scope === "external") {
        // Auto-fill sensitivity & access
        document.querySelector('input[value="confidential"]').checked = true;
        document.querySelector('input[value="custom"]').checked = true;

        // Skip to final step
        steps[currentStep].classList.remove("active");
        currentStep = steps.length - 1;
        steps[currentStep].classList.add("active");
        return;
      } else {
        // Internal → move to step 2
        currentStep++;
        steps[currentStep].classList.add("active");
        steps[currentStep - 1].classList.remove("active");
        return;
      }
    }

    // For other steps
    if (currentStep < steps.length - 1) {
      steps[currentStep].classList.remove("active");
      currentStep++;
      steps[currentStep].classList.add("active");
    }
  });
});

document.querySelectorAll(".prev").forEach(button => {
  button.addEventListener("click", () => {
    if (currentStep > 0) {
      steps[currentStep].classList.remove("active");
      currentStep--;
      steps[currentStep].classList.add("active");
    }
  });
});

// Final submit logic
form.addEventListener("submit", function(e) {
  e.preventDefault();

  const resultDiv = document.getElementById("result");

  const shareOrEmail = document.querySelector('input[name="share_or_email"]:checked')?.value || "";
  const scopeInput = document.querySelector('input[name="scope"]:checked');
  const sensitivityInput = document.querySelector('input[name="sensitivity"]:checked');
  const accessInput = document.querySelector('input[name="access"]:checked');

  // Validate required fields
  if (shareOrEmail === "share" && (!scopeInput || !sensitivityInput || !accessInput)) {
    resultDiv.className = "error";
    resultDiv.innerHTML = "<strong>Error:</strong> Please complete all steps before submitting.";
    return;
  }

  if (shareOrEmail === "email") {
    // Hardcoded values for email
    labelName = "External Confidential";
    access = "custom";
  } else {
    const scope = scopeInput.value;
    const sensitivity = sensitivityInput.value;
    const access = accessInput.value;

    let labelName = `${scope.charAt(0).toUpperCase() + scope.slice(1)} ${sensitivity.charAt(0).toUpperCase() + sensitivity.slice(1)}`;
    
    // Validation rules here (same as before)
    if (access === "custom") {
      if ((scope === "internal" && sensitivity !== "confidential") ||
          (scope === "external" && sensitivity !== "confidential")) {
        resultDiv.className = "error";
        resultDiv.innerHTML = `<strong>Error:</strong> 'Custom' access is only allowed for '<strong>${labelName}</strong>'`;
        return;
      }
    }

    if (access === "rw") {
      if ((scope === "internal" && sensitivity === "public") ||
          (scope === "external" && sensitivity !== "general")) {
        resultDiv.className = "error";
        resultDiv.innerHTML = `<strong>Error:</strong> 'R/W' access is not allowed for '<strong>${labelName}</strong>'`;
        return;
      }
    }

    if (access === "read-only") {
      const validInternal = ["public", "general"];
      const validExternal = ["public", "general"];

      if ((scope === "internal" && !validInternal.includes(sensitivity)) ||
          (scope === "external" && !validExternal.includes(sensitivity))) {
        resultDiv.className = "error";
        resultDiv.innerHTML = `<strong>Error:</strong> 'Read Only' access is not allowed for '<strong>${labelName}</strong>'`;
        return;
      }
    }
  }

  resultDiv.className = "result success";
  resultDiv.innerHTML = `
    <h3>Recommended Sensitivity Label:</h3>
    <p><strong>${labelName}</strong></p>
    <p>Access Type: <strong>${access.replace("-", " ")}</strong></p>
    <p>This label ensures your content is protected appropriately.</p>
  `;
});
