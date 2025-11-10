// Booking Page Logic(amount calculation logic);
function calculatePrice() {
     const __bookingMeta = document.getElementById('booking-data');
    const pricePerNight = __bookingMeta ? parseFloat(__bookingMeta.dataset.price || "0") : 0;
    const checkIn = document.getElementById("checkIn").value;
    const checkOut = document.getElementById("checkOut").value;

    if (checkIn && checkOut) {
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);

        const diffTime = outDate - inDate;
        const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (nights > 0) {
            const basePrice = nights * pricePerNight;
            const tax = basePrice * 0.18;
            const total = basePrice + tax;

            document.getElementById("price-nights").innerText =
                `${nights} night x ₹ ${pricePerNight.toLocaleString('en-IN')}`;
            document.getElementById("price-base").innerText =
                `₹${basePrice.toLocaleString('en-IN')}`;
            document.getElementById("price-tax").innerText =
                `₹${tax.toLocaleString('en-IN')}`;
            document.getElementById("price-total").innerText =
                `₹${total.toLocaleString('en-IN')}`;
        }
    }
}

// // Add listeners to date fields
// document.getElementById("checkIn").addEventListener("change", calculatePrice);
// document.getElementById("checkOut").addEventListener("change", calculatePrice);

// // Flatpickr Initialization
// flatpickr("#checkIn", {
//     dateFormat: "Y-m-d",
//     minDate: "today",
//     disable: bookedRanges
// });

// flatpickr("#checkOut", {
//     dateFormat: "Y-m-d",
//     minDate: "today",
//     disable: bookedRanges
// });
