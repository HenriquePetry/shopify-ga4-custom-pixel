# Custom Pixel GA4 for Shopify Plus

This repository contains a custom pixel for implementing standard Google Analytics 4 (GA4) events in Shopify Plus stores. The pixel is designed to track e-commerce events following the standard GA4 event format.

## Features

- Complete e-commerce funnel tracking (product view, add to cart, checkout, purchase)
- Google Tag Manager integration
- Automatic mapping of Shopify events to GA4 events
- Product list and search tracking
- Navigation information persistence via sessionStorage

## Supported Events

The pixel maps the following Shopify events to GA4 events:

| Shopify Event | GA4 Event |
|----------------|------------|
| checkout_completed | purchase |
| payment_info_submitted | add_payment_info |
| checkout_shipping_info_submitted | add_shipping_info |
| checkout_started | begin_checkout |
| product_added_to_cart | add_to_cart |
| cart_viewed | view_cart |
| page_viewed | page_viewed |
| product_viewed | view_item |
| search_submitted | search |
| collection_viewed | view_item_list |

## Installation

1. In the Shopify Plus admin panel, navigate to Settings > Apps and sales channels > Develop apps
2. Create a new custom pixel
3. Copy and paste the code from the `custom-pixel.js` file into the code editor
4. **Important:** Replace the `webGTMID` variable on line 6 with your own GTM ID:
   ```javascript
   var webGTMID = 'XXX-XXXXXX';
   ```
5. Save and publish the pixel

## Additional Configuration

### Google Tag Manager

Configure your GTM container to process dataLayer events. The events are already formatted according to GA4 specifications.

### Session Storage

The pixel uses `sessionStorage` to maintain information about product lists between pages. This allows traffic sources (such as collections or search results) to be correctly tracked when a user navigates to a product.

## Customization

To customize the pixel for your store:

1. Adjust event names as needed in the `shopifyStandardEventToGtagEventsMap` object
2. Modify data mapping functions according to your specific requirements
3. Add custom events using the `analytics.subscribe` method

## Code Structure

- **Initialization:** Initial configuration of variables and dataLayer
- **Utility Functions:** Functions for data manipulation and formatting
- **Event Adapters:** Conversion of Shopify events to GA4 format
- **Event Handlers:** Processing and sending events to the dataLayer

## Compatibility

This pixel is compatible with the latest version of Shopify Plus and follows Google Analytics 4 implementation guidelines.

## Contribution

Contributions are welcome! Please create an issue or pull request for suggestions or improvements.
