let razorpayLoadPromise;

export function loadRazorpay() {
  if (typeof window.Razorpay === "function") {
    return Promise.resolve(true);
  }

  if (!razorpayLoadPromise) {
    razorpayLoadPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    }).then((loaded) => {
      if (!loaded) {
        razorpayLoadPromise = undefined;
      }
      return loaded;
    });
  }

  return razorpayLoadPromise;
}
