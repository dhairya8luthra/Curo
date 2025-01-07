import axios from "axios";
import zlib from "zlib";
import { writeFile } from "fs/promises";
import { promisify } from "util";

const gunzip = promisify(zlib.gunzip);

// Base URL and headers for Pharmeasy
const PHARMEASY_BASE_URL =
  "https://pharmeasy.in/api/search/search/?intent_id=1736254134724&q=dolo&page=";
const PHARMEASY_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
};
const APOLLO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36",
  "Content-Type": "application/json",
  "Authorization":"Oeu324WMvfKOj5KMJh2Lkf00eW1"
  
};

// Base URL for 1mg
const ONE_MG_BASE_URL =
  "https://www.1mg.com/pharmacy_api_webservices/search-all?city=Gurgaon&eta_pincode&fetch_eta=true&is_city_serviceable=true&name=dolo&pageSize=40&scroll_id=Rre-0688yDrQYBn-2UkFiY-vOvNzHZ9Vlp5wJSeiWio%3D&types=sku%2Callopathy&name=dolo&filter=true&state=1&page_number=";

// Base URL for Apollo Pharmacy
const APOLLO_BASE_URL = "https://search.apollo247.com/v3/fullSearch";

// Apollo Pharmacy search payload
const payload = {
  query: "dolo",
  page: 1,
  productsPerPage: 24,
  selSortBy: "relevance",
  filters: [],
  pincode: "",
};

// Function to fetch data from Pharmeasy
const fetchPharmeasyData = async (page) => {
  try {
    const response = await axios.get(`${PHARMEASY_BASE_URL}${page}`, {
      headers: PHARMEASY_HEADERS,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching Pharmeasy page ${page}:`, error.message);
    return null;
  }
};

// Function to fetch data from 1mg (with decompression if required)
const fetchOneMgData = async (pageNumber) => {
  try {
    const response = await axios.get(`${ONE_MG_BASE_URL}${pageNumber}`, {
      responseType: "arraybuffer",
      headers: { "Accept-Encoding": "gzip, deflate, br" },
    });

    let decompressedData;
    const contentEncoding = response.headers["content-encoding"];

    if (contentEncoding?.includes("gzip")) {
      decompressedData = await gunzip(response.data);
    } else {
      decompressedData = response.data; // If not compressed
    }

    const jsonData = JSON.parse(decompressedData.toString("utf-8"));
    console.log("jsonData", jsonData);
    return jsonData;
  } catch (error) {
    console.error(`Error fetching 1mg page ${pageNumber}:`, error.message);
    return null;
  }
};

const fetchApolloData = async (page) => {
  const payload = {
    query: "dolo",
    page: page,
    productsPerPage: 24,
    selSortBy: "relevance",
    filters: [],
    pincode: "",
  };

  try {
    const response = await axios.post(APOLLO_BASE_URL, payload, {
      headers: APOLLO_HEADERS,
    });

    // Log raw response data for debugging
    console.log("Apollo Pharmacy raw response:", response.data);

    // Check for response status and data before processing
    if (response.status !== 200) {
      console.error(`Error: Received non-200 status code ${response.status}`);
      return null;
    }

    if (!response.data || !response.data.data) {
      console.error(`Error: No data found in Apollo response.`);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching Apollo Pharmacy page ${page}:`, error.message);
    return null;
  }
};

// Updated function to process Apollo Pharmacy data with null checks
const processApolloData = async (data, page) => {
  try {
    // Log data to verify structure before processing
    console.log("Apollo Pharmacy data:", data);

    // Check if data is valid and contains products
    if (!data || !data.data || !Array.isArray(data.data.products)) {
      console.error("Error: Invalid or empty data structure", data);
      return;
    }

    const products = data.data.products.map((product) => ({
      name: product.name,
      price: product.specialPrice || product.price, // Handle both regular and special prices
      availability: product.status || "N/A",
      images: product.thumbnail || "N/A",
    }));

    const fileName = `apollo_page_${page}.json`;
    await writeFile(fileName, JSON.stringify(products, null, 2));
    console.log(`Apollo Pharmacy Page ${page} data saved to ${fileName}`);
  } catch (error) {
    console.error("Error processing Apollo Pharmacy data:", error.message);
  }
};
// Function to process and save Pharmeasy data
const processPharmeasyData = async (data, page) => {
  try {
    const products = data.data.products.map((product) => ({
      name: product.name,
      slug: product.slug,
      manufacturer: product.manufacturer,
      price: product.salePriceDecimal,
      availability: product.productAvailabilityFlags.isAvailable,
      images: product.image,
    }));

    const fileName = `pharmeasy_page_${page}.json`;
    await writeFile(fileName, JSON.stringify(products, null, 2));
    console.log(`Pharmeasy Page ${page} data saved to ${fileName}`);
  } catch (error) {
    console.error("Error processing Pharmeasy data:", error.message);
  }
};

// Function to process and save 1mg data
const processOneMgData = async (response, pageNumber) => {
  try {
    if (!response || !response.results || !Array.isArray(response.results)) {
      console.error(
        `Unexpected response structure on page ${pageNumber}:`,
        response
      );
      return;
    }

    const products = [];
    response.results.forEach((result) => {
      if (
        result.value &&
        result.value.data &&
        Array.isArray(result.value.data)
      ) {
        result.value.data.forEach((product) => {
          products.push({
            brand_name: product.brand_name || "N/A",
            discounted_price: product.discounted_price || "N/A",
            label: product.label || "N/A",
            url: product.url ? `https://www.1mg.com${product.url}` : "N/A",
            cropped_image: product.cropped_image || "N/A",
          });
        });
      }
    });

    if (products.length === 0) {
      console.log(`No products found on page ${pageNumber}.`);
      return;
    }

    const fileName = `1mg_page_${pageNumber}.json`;
    await writeFile(fileName, JSON.stringify(products, null, 2));
    console.log(`1mg Page ${pageNumber} data saved to ${fileName}`);
  } catch (error) {
    console.error("Error processing 1mg data:", error.message);
  }
};

// Function to process and save Apollo Pharmacy data

// Main function to scrape data
const scrapeData = async () => {
  // Scrape Pharmeasy data
  for (let page = 0; page < 4; page++) {
    console.log(`Fetching Pharmeasy page ${page}...`);
    const pharmeasyData = await fetchPharmeasyData(page);
    if (pharmeasyData) {
      await processPharmeasyData(pharmeasyData, page);
    }
  }

  // Scrape 1mg data
  for (let pageNumber = 0; pageNumber < 1; pageNumber++) {
    console.log(`Fetching 1mg page ${pageNumber}...`);
    const oneMgData = await fetchOneMgData(pageNumber);
    if (oneMgData) {
      await processOneMgData(oneMgData, pageNumber);
    }
  }

  // Scrape Apollo Pharmacy data
  for (let page = 1; page <= 1; page++) {
    console.log(`Fetching Apollo Pharmacy page ${page}...`);
    const apolloData = await fetchApolloData(page);
    if (apolloData) {
      await processApolloData(apolloData, page);
    }
  }

  console.log("Scraping completed. JSON files created.");
};

// Start the scraper
scrapeData();
