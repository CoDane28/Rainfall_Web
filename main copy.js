// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy , where, onSnapshot} from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-database.js";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDFuVu4AKkU-yw-vEdHwSBYQGK2gSWiM-M",
    authDomain: "rainfall-web-1e47f.firebaseapp.com",
    projectId: "rainfall-web-1e47f",
    databaseURL: "https://rainfall-web-1e47f-default-rtdb.asia-southeast1.firebasedatabase.app/",
    storageBucket: "rainfall-web-1e47f.appspot.com",
    messagingSenderId: "11042584123",
    appId: "1:11042584123:web:647afdd8a739d014144e1e"
  };


const firebaseApp = initializeApp(firebaseConfig);
const customDBVariable = getDatabase(firebaseApp);
const db = getFirestore(firebaseApp);
// Function to show only the dashboard content
function showDashboardContent() {
    // Hide all content sections except dashboardContent
    contentSections.forEach(section => {
        if (section.id === 'dashboardContent') {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });

    // Scroll to the top of the middle container
    const middleContainer = document.querySelector('.middle');
    if (middleContainer) {
        middleContainer.scrollTop = 0;
    }
}

// Show only dashboard content when page reloads
window.addEventListener('load', () => {
    showDashboardContent();
});

// Additional JavaScript code...
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const contentSections = document.querySelectorAll('.content-section');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        // Hide all content sections
        contentSections.forEach(section => {
            section.style.display = 'none';
        });

        // Get the target content section
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);

        // Display the target content section
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Scroll to the top of the middle container
        const middleContainer = document.querySelector('.middle');
        if (middleContainer) {
            middleContainer.scrollTop = 0;
        }
    });
});

//============== MAP PICKER =================//
document.addEventListener("DOMContentLoaded", function () {
    var sidebarLinks = document.querySelectorAll(".sidebar-link");
    sidebarLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            sidebarLinks.forEach(function (l) {
                l.classList.remove("active");
            });
            link.classList.add("active");
        });
    });
    
    // Check if the map container exists on the page
    var map = L.map('map').setView([13.75, 120.95], 10); // Set the initial view to cover Batangas
    var batangasBounds = L.latLngBounds([13.2, 119.5], [14.2, 122.0]); // Adjust the bounds to cover a larger area for the entire province
    map.setMaxBounds(batangasBounds);
    map.on('drag', function () {
        map.panInsideBounds(batangasBounds, { animate: false });
    });
    L.tileLayer('https://tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png?apikey=af13559acdd84323962af4cafc51d063').addTo(map);

    var marker;

    // Event listener for clicking on the map
    function handleMapClick(e) {
        // Remove the existing marker if present
        if (marker) {
            map.removeLayer(marker);
        }

        // Add a new marker at the clicked location
        marker = L.marker(e.latlng).addTo(map);

        // Update latitude and longitude input fields
        document.getElementById('latitudeInput').value = e.latlng.lat.toFixed(6);
        document.getElementById('longitudeInput').value = e.latlng.lng.toFixed(6);
        
        // Reverse geocoding to get the location name
        reverseGeocode(e.latlng);
        
        function reverseGeocode(latlng) {
            // Use a geocoding service to get location details
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`)
                .then(response => response.json())
                .then(data => {
                    // Update the search location input field with the location name
                    document.getElementById('locationSearchInput').value = data.display_name;
                })
                .catch(error => console.error('Error fetching location details:', error));
        }
    }

    map.on('click', handleMapClick);
  

    // Update main content once on page load
    updateMainContent();
     // Event listener for clicking the search location button
     document.getElementById('searchLocation').addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default form submission behavior
     // Retrieve latitude and longitude from input fields
    var latitude = parseFloat(document.getElementById('latitudeInput').value);
    var longitude = parseFloat(document.getElementById('longitudeInput').value);

    // Check if latitude and longitude are valid numbers
    if (!isNaN(latitude) && !isNaN(longitude)) {
        // Set map view to the specified coordinates
        map.setView([latitude, longitude], 30); // 10 is the zoom level, you can adjust it as needed
    } else {
        // Handle invalid input (e.g., show an error message)
        console.error('Invalid latitude or longitude input');
    }   
 });
//============== ADD BUTTON =================//
 // Add event listener for 'addBtn' element

 document.getElementById('addBtn').addEventListener('click', function (event) {
    // Get rainfall value from input
    event.preventDefault(); // Prevent default form submission behavior
    const rainfallInput = document.getElementById('rainfallInput');
    const rainfallValue = parseFloat(rainfallInput.value);

    // Get selected date from input
    const selectedDate = new Date(document.getElementById('PickerDate').value);

    // Get selected time from input
    const selectedTime = document.getElementById('timeInput').value;
    const [hours, minutes] = selectedTime.split(':');

    // Check if the selected time is PM and adjust hours accordingly
    let adjustedHours = parseInt(hours);
    if (selectedTime.toLowerCase().includes('pm')) {
        adjustedHours = (adjustedHours % 12) + 12; // Convert to 24-hour format
    }

    selectedDate.setHours(adjustedHours, parseInt(minutes)); // Set selected time

    // Get location name, latitude, and longitude from input fields
    const locationName = document.getElementById('locationSearchInput').value;
    const latitudeInput = document.getElementById('latitudeInput');
    const longitudeInput = document.getElementById('longitudeInput');
    const latitude = parseFloat(latitudeInput.value);
    const longitude = parseFloat(longitudeInput.value);

    // Check if any of the required fields are empty
    if (isNaN(rainfallValue) && rainfallInput.value.trim() !== "") {
        alert("Please enter a valid rainfall value.");
        rainfallInput.focus();
        return; // Exit the function early if rainfall value is not a number
    }
    if (!selectedDate || isNaN(selectedDate.getTime())) {
        alert("Please select a valid date and time.");
        return; // Exit the function early if date is empty or not valid
    }
    if (!locationName.trim() || !latitude || isNaN(latitude) || !longitude || isNaN(longitude)) {
        alert("Please enter a valid location.");
        document.getElementById('locationSearchInput').focus();
        return; // Exit the function early if location details are incomplete
    }

    // Add data to Firestore with date and time
    addRainfallData(locationName, latitude, longitude, rainfallValue, selectedDate);
});

// Function to add rainfall data with date without time
const addRainfallData = async (locationName, latitude, longitude, rainfallValue, selectedDate) => {
    try {
        // Add a new document with data to the "rainfall" collection
        await addDoc(collection(db, "rainfall"), {
            locationName: locationName,
            latitude: latitude,
            longitude: longitude,
            rainfallValue: rainfallValue,
            timestamp: selectedDate // Use selected date without time
        });
        console.log("Rainfall data added successfully!");   
        updateMapWithRainfallData();
    } catch (error) {
        console.error("Error adding rainfall data: ", error);
    }
};



});

// Call updateMainContent after the page loads
document.addEventListener('DOMContentLoaded', function () {
    // Retrieve and display Firebase data
    updateMainContent();
    
});
//============== UPDATE CONTENT =================//


// Function to update the main content with data from Firestore
async function updateMainContent() {
    try {
        // Fetch the data from Firestore sorted by timestamp in descending order
        const querySnapshot = await getDocs(query(collection(db, 'rainfall'), orderBy('timestamp', 'desc')));
        
        // Check if there is any data
        if (!querySnapshot.empty) {
            // Get the latest document data
            const latestData = querySnapshot.docs[0].data(); // Assuming the latest document is at index 0

            // Update the HTML elements in the flexbox
            const rainfallResultText = document.getElementById('rainfallResultText');
            const locationResultText = document.getElementById('locationResultText');

            // Update the rainfall and location text
            if (rainfallResultText && locationResultText) {
                // Format rainfall value with "mm" suffix
                const formattedRainfall = `${latestData.rainfallValue} mm`;
                rainfallResultText.textContent = formattedRainfall;

                // Remove "Calabarzon, 4223, Philippines" from location
                const formattedLocation = latestData.locationName.replace(', Calabarzon, 4223, Philippines', '');
                locationResultText.textContent = formattedLocation;
            } else {
                console.log("One or both of the HTML elements not found.");
            }

            // Create the chart
            console.log("Chart data:", querySnapshot.docs.map(doc => doc.data())); // Log data for debugging
            createChart(querySnapshot.docs.map(doc => doc.data()));
        } else {
            console.log("No user data found in Firestore.");
        }
    } catch (error) {
        console.error('Error updating main content:', error);
    }
}



//============== CHART =================//
// Function to create the chart using data from Firestore
function createChart(allRainfallData) {
    var chartCanvas = document.getElementById('chart');

    if (allRainfallData && window.Chart && chartCanvas) {
        // Clear the canvas before creating the chart
        var ctx = chartCanvas.getContext('2d');
        ctx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);

        // Check if there's an existing chart instance
        if (window.myChart) {
            window.myChart.destroy();
        }

        // Sort the data by timestamp in ascending order
        allRainfallData.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());

        var timestampDataArray = allRainfallData.map(entry => {
            var timestamp = entry.timestamp.toDate(); // Convert Firestore timestamp to JavaScript Date object
            return timestamp.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });
        });
        var locationDataArray = allRainfallData.map(entry => entry.locationName);
        var labelsArray = timestampDataArray.map((timestamp, index) => `${timestamp}\n${locationDataArray[index]}`);
        var rainfallDataArray = allRainfallData.map(entry => entry.rainfallValue);

        var myChart = new Chart(chartCanvas, {
            type: 'line',
            data: {
                labels: labelsArray,
                datasets: [{
                    label: 'Rainfall Data',
                    data: rainfallDataArray,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(0, 0, 0, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    x: {
                        display: false
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        // Store the new chart instance
        window.myChart = myChart;

        return myChart;
    }
}

// Call function to retrieve data from Firestore
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Query Firestore to get all rainfall data
        const querySnapshot = await getDocs(collection(db, "rainfall"));
        const allRainfallData = [];
        querySnapshot.forEach(doc => {
            allRainfallData.push(doc.data());
        });

        // Create chart with the retrieved data
        createChart(allRainfallData);
    } catch (error) {
        // Handle any errors silently
    }
});


//============== RIGHT CONTENT =================//

// Function to update the right section content using data from Firestore
var dataListElement = document.getElementById('dataList');
function updateRightContainer(allRainfallData) {
    // Sort the data by timestamp in descending order
    allRainfallData.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
 
    dataListElement.innerHTML = '';

    allRainfallData.forEach(function (userData) {
        var listItem = document.createElement('li');

        // Create and style Time data point
        var timePoint = document.createElement('div');
        var timestamp = userData.timestamp.toDate();
        var formattedTime = timestamp.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric'
        });
        timePoint.textContent = formattedTime;
        timePoint.classList.add('timeFont'); // Add class for styling
        listItem.appendChild(timePoint);

        // Create and style Date data point
        var datePoint = document.createElement('div');
        var formattedDate = timestamp.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
        datePoint.textContent = formattedDate;
        datePoint.classList.add('dateFont'); // Add class for styling
        listItem.appendChild(datePoint);

        // Create and style Rainfall label
        var rainfallLabel = document.createElement('div');
        rainfallLabel.textContent = 'Rainfall:';
        rainfallLabel.classList.add('rainfallLabel');
        listItem.appendChild(rainfallLabel);

        // Create and style Rainfall value
        var rainfallValue = document.createElement('div');
        rainfallValue.textContent = `${userData.rainfallValue} mm`;
        rainfallValue.classList.add('rainfallFont');
        listItem.appendChild(rainfallValue);

        // Create and style Location data point
        var locationLabel = document.createElement('div');
        locationLabel.textContent = 'Location:';
        locationLabel.classList.add('locationLabel');
        listItem.appendChild(locationLabel);
        
        var locationPoint = document.createElement('div');
        locationPoint.classList.add('locationFont');
        var locationArray = userData.locationName.split(", "); // Split location by comma and space
        var location = locationArray.slice(0, -3).join(", "); // Keep only the relevant parts of the location
        locationPoint.textContent = `${location}`;
        listItem.appendChild(locationPoint);

        

        dataListElement.appendChild(listItem);
    });
}

// Call function to update right section content with data from Firestore
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Query Firestore to get all rainfall data
        const querySnapshot = await getDocs(collection(db, "rainfall"));
        const allRainfallData = [];
        querySnapshot.forEach(doc => {
            allRainfallData.push(doc.data());
        });

        // Update right section content with the retrieved data
        updateRightContainer(allRainfallData);
    } catch (error) {
        console.error("Error updating right section content: ", error);
    }
});



//============== DATE PICKER =================//

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Flatpickr with current date as placeholder
    flatpickr("#datePicker", {
        dateFormat: "F j, Y",
        altInput: true,
        altFormat: "F j, Y",
        defaultDate: "Select Date", // Set default date to today
        onChange: function(selectedDates, dateStr, instance) {
            var selectedDate = selectedDates[0];
            displayDataForDate(selectedDate);
        }
    });

    async function retrieveData(selectedDate) {
        try {
            // Get the start and end timestamps for the selected date
            const startTimestamp = new Date(selectedDate);
            startTimestamp.setHours(0, 0, 0, 0); // Set time to start of day
            const endTimestamp = new Date(selectedDate);
            endTimestamp.setHours(23, 59, 59, 999); // Set time to end of day
    
            // Query Firestore for data within the selected date range
            const q = query(collection(db, 'rainfall'), where('timestamp', '>=', startTimestamp), where('timestamp', '<=', endTimestamp));
            const querySnapshot = await getDocs(q);
    
            const data = [];
            querySnapshot.forEach((doc) => {
                data.push(doc.data());
            });
            console.log("Retrieved data:", data);
            return data;
        } catch (error) {
            console.error('Error retrieving data from Firestore:', error);
            return []; // Return empty array in case of error
        }
    }
    
    // Function to display data for the specified date
async function displayDataForDate(selectedDate) {
    // Retrieve data from Firestore for the selected date
    const data = await retrieveData(selectedDate);
    if (data.length > 0) {
        console.log("Data for", selectedDate.toLocaleDateString(), ":", data);
        // Display chart, flexbox, and right content
        updateMainContent(data); // Update the main content with the retrieved data
        createChart(data); // Create or update the chart with the retrieved data
        updateRightContainer(data); // Update the right section content with the retrieved data
    } else {
        console.log("No data available for", selectedDate.toLocaleDateString());
        // Hide chart, flexbox, and right content
        hideMainContent();
    }
}

// Function to update the main content with data from Firestore
async function updateMainContent(data) {
    // Update the HTML elements in the flexbox
    const rainfallResultText = document.getElementById('rainfallResultText');
    const locationResultText = document.getElementById('locationResultText');

    // Update the rainfall and location text
    if (rainfallResultText && locationResultText) {
        rainfallResultText.textContent = `${data[0].rainfallValue} mm`; // Assuming the latest document is at index 0
        locationResultText.textContent = `${data[0].locationName}`; // Assuming the latest document is at index 0
    } else {
        console.log("One or both of the HTML elements not found.");
    }
}

// Function to hide main content
function hideMainContent() {
    // Hide chart, flexbox, and right content
    const chartCanvas = document.getElementById('chart');
    const dataListElement = document.getElementById('dataList');
    const rainfallResultText = document.getElementById('rainfallResultText');
    const locationResultText = document.getElementById('locationResultText');

    if (chartCanvas) {
        chartCanvas.style.display = 'none';
    }
    if (dataListElement) {
        dataListElement.innerHTML = ''; // Clear the right section content
    }
    if (rainfallResultText) {
        rainfallResultText.textContent = ''; // Clear rainfall text
    }
    if (locationResultText) {
        locationResultText.textContent = ''; // Clear location text
    }
}
});

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Flatpickr with current date as placeholder
    flatpickr("#PickerDate", {
        dateFormat: "Y-m-d", // Set date format
        altInput: true,
        altFormat: "F j, Y", // Set the format of the alternate input field
        defaultDate: "Select Date", // Set default date to today
        onChange: function(selectedDates, dateStr, instance) {
            // Handle date change event here
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    // Initialize Flatpickr for time input field
    flatpickr("#timeInput", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        time_24hr: false,
        theme: "material_blue",
        onReady: function (selectedDates, dateStr, instance) {
            instance.set("defaultDate", new Date());
        }
    });
});





//============== MUNICIPALITY CONTENT =================//

//============== TALISAY CHART =================//
document.addEventListener('DOMContentLoaded', function () {
    const talisayButton = document.getElementById('talisayButton');
    const talisayChartContainer = document.getElementById('talisayChartContainer');
    
    // Add event listener to Talisay button
    talisayButton.addEventListener('click', async function () {
        // Show the chart container for Talisay
        talisayChartContainer.style.display = 'block';
        
        // Hide other chart containers if necessary
        // Replace 'otherChartContainer' with the ID of other chart containers
        // document.getElementById('otherChartContainer').style.display = 'none';

        // Fetch and display Talisay chart data
        await displayTalisayChartData();
    });
});


document.addEventListener('DOMContentLoaded', function () {
    const talisayButton = document.getElementById('talisayButton');
    const modal = document.getElementById('myModal');
    const span = document.getElementsByClassName('close')[0];

    // Add event listener to Talisay button
    talisayButton.addEventListener('click', async function () {
        // Show the modal
        modal.style.display = 'block';

        // Fetch and display Talisay chart data
        await displayTalisayChartData();
    });

    // Close the modal when the close button is clicked
    span.onclick = function() {
        modal.style.display = 'none';
    }

    // Close the modal when the user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
});


// Function to fetch and display Talisay chart data

// Your existing code to fetch and display Talisay chart data
async function displayTalisayChartData() {
    try {
        // Fetch initial Talisay data from Firestore
        const talisayData = await getTalisayDataFromFirestore();
        const talisayChartCanvas = document.getElementById('talisayChart');
        renderChart(talisayChartCanvas, talisayData); // Render chart using fetched data

        // Add a real-time listener to the Talisay data collection in Firestore
        const unsubscribe = onSnapshot(collection(db, 'rainfall'), querySnapshot => {
            // Filter and update the chart with the latest Talisay data
            const latestTalisayData = querySnapshot.docs
                .map(doc => doc.data())
                .filter(data => data.locationName && data.locationName.includes('Talisay') && data.locationName.includes('Batangas'));

            renderChart(talisayChartCanvas, latestTalisayData); // Render chart with updated data
        });

        // Function to unsubscribe from the real-time listener when necessary
        function unsubscribeListener() {
            unsubscribe();
        }
    } catch (error) {
        console.error('Error fetching Talisay data:', error);
    }
}

async function getTalisayDataFromFirestore() {
    try {
        // Query Firestore to get all documents
        const querySnapshot = await getDocs(collection(db, 'rainfall'));

        console.log('Number of documents:', querySnapshot.docs.length); // Log number of documents

        // Filter documents where locationName contains "Talisay" and "Batangas"
        const talisayData = querySnapshot.docs
            .map(doc => doc.data())
            .filter(data => data.locationName && data.locationName.includes('Talisay') && data.locationName.includes('Batangas'));

        console.log('Number of documents for Talisay:', talisayData.length); // Log number of Talisay documents

        // Log the filtered documents
        talisayData.forEach(data => {
            console.log('Document data:', data);
        });

        return talisayData;
    } catch (error) {
        console.error('Error fetching Talisay data from Firestore:', error);
        return []; // Return empty array in case of error
    }
}

// Function to render the chart using Chart.js
function renderChart(canvas, data) {
    // Check if there's an existing chart instance associated with the canvas
    if (window.myChart) {
        // Destroy the existing chart instance to release the canvas
        window.myChart.destroy();
    }

    // Convert timestamp to JavaScript Date object and sort the data array
    data.sort((a, b) => a.timestamp.toDate() - b.timestamp.toDate());

    // Process data and render the chart using Chart.js
    const chartData = {
        labels: data.map(entry => entry.timestamp.toDate().toLocaleDateString()), // Assuming timestamp is the field containing date information
        datasets: [{
            label: 'Rainfall Data for Talisay, Batangas',
            data: data.map(entry => entry.rainfallValue),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    };

    console.log('Chart Data:', chartData); // Log chart data for debugging

    // Create and render the chart using Chart.js
    window.myChart = new Chart(canvas, {
        type: 'line',
        data: chartData,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}





// Add a real-time listener to the Firestore collection
const unsubscribe = onSnapshot(collection(db, "rainfall"), (snapshot) => {
    const allRainfallData = [];
    snapshot.forEach(doc => {
        allRainfallData.push(doc.data());
    });

    console.log("All rainfall data:", allRainfallData); // Log all rainfall data

    // Update the main content with the retrieved data
    updateMainContent(allRainfallData);
    console.log("Main content updated");

    // Update the chart with the retrieved data
    createChart(allRainfallData);
    console.log("Chart updated");

    // Update the right section content with the retrieved data
    updateRightContainer(allRainfallData);
    console.log("Right section content updated");

    
});

// Function to unsubscribe from the real-time listener when necessary
function unsubscribeListener() {
    unsubscribe();
}
// Function to handle back button click event
function handleBackButtonClick() {
    // Reload the page to restart the website
    window.location.reload();  
}



  

