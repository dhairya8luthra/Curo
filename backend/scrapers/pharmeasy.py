import scrapy
from scrapy.crawler import CrawlerProcess
import json
import csv


class Pharmeasy(scrapy.Spider):
    name = 'pharmeasy'
    
    base_url = 'https://pharmeasy.in/api/search/search/?intent_id=1736254134724&q=dolo&page='
    
    headers = {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36'
    }
    
    def __init__(self):
        # Initialize the CSV file with headers
        with open('pharmeasy.csv', 'w') as csv_file:
            csv_file.write('name,slug,manufacturer,price,availability,images\n')
    
    def start_requests(self):
        # Loop through the desired pages
        for page in range(0, 4):  # Specify the page range
            next_page = self.base_url + str(page)
            yield scrapy.Request(url=next_page, headers=self.headers, callback=self.parse)
    
    def parse(self, res):
        try:
            # Parse the API response
            data = json.loads(res.body)
            
            # Extract product details
            for product in data['data']['products']:
                items = {
                    'name': product['name'],
                    'slug': product['slug'],
                    'manufacturer': product['manufacturer'],
                    'price': product['salePriceDecimal'],
                    'availability': product['productAvailabilityFlags']['isAvailable'],
                    'images': product['image']  # Update this based on actual response
                }

                # Write to CSV file
                with open('pharmeasy.csv', 'a') as csv_file:
                    writer = csv.DictWriter(csv_file, fieldnames=items.keys())
                    writer.writerow(items)
        
        except Exception as e:
            self.log(f"Error parsing response: {e}", level=scrapy.log.ERROR)


# Run the spider
process = CrawlerProcess()
process.crawl(Pharmeasy)
process.start()
