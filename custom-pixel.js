// Step 1. Initialize the JavaScript pixel SDK (make sure to exclude HTML)

// Step 2. Subscribe to customer events with analytics.subscribe(), and add tracking
//  analytics.subscribe("all_standard_events", event => {
//    console.log("Event data ", event?.data);
//  });
var webGTMID = "XXX-XXXXXX";

// Define "isCheckout", to check if it's a checkout page.
const isCheckout =
  init.context.document.location.pathname.includes("/checkouts");

// Define content_group for GA4
// If isCheckout, content_group is set as "checkout", else, it's value is retrieved from sessionStorage "content_group", which is set on the theme with the value of liquid object {{ template.name }}: https://shopify.dev/docs/api/liquid/objects/template
const contentGroup = isCheckout
  ? "checkout"
  : window.sessionStorage.getItem("content_group");

//Initialize dataLayer
window.dataLayer = window.dataLayer || [];

//Push initial variables to dataLayer
(function () {
  dataLayer.push({
    ignore_referrer: String(isCheckout),
    content_group: contentGroup,
    page_location: init.context.document.location.href,
  });
})();

//load GTM
(function (w, d, s, l, i) {
  w[l] = w[l] || [];
  w[l].push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  var f = d.getElementsByTagName(s)[0],
    j = d.createElement(s),
    dl = l != "dataLayer" ? "&l=" + l : "";
  j.async = true;
  j.src = "https://www.googletagmanager.com/gtm.js?id=" + i + dl;
  f.parentNode.insertBefore(j, f);
})(window, document, "script", "dataLayer", webGTMID);

function isObject(val) {
  return (
    typeof val === "object" &&
    !Array.isArray(val) &&
    val !== null &&
    val instanceof RegExp === false &&
    val instanceof Date === false
  );
}

function iso8601ToUnixGmt(iso8601String) {
  const date = new Date(iso8601String);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid ISO8601 format");
  }
  const timestampMs = date.getTime();
  return Math.floor(timestampMs / 1000);
}

function timestamp(shopifyEvent) {
  return {
    timestamp_iso_8601: shopifyEvent.timestamp,
    timestamp_unix_gmt: iso8601ToUnixGmt(shopifyEvent.timestamp),
  };
}

function userData(shopifyEvent) {
  if (!shopifyEvent.data?.checkout && !init.data.customer) {
    console.log("No user data available.");
    return {};
  } else {
    const user_data = {
      id: window.sessionStorage.getItem("_shopify_s"),
      email: shopifyEvent.data?.checkout?.email || init.data.customer?.email,
      phone:
        shopifyEvent.data?.checkout?.phone ||
        init.data.customer?.phone ||
        shopifyEvent.data?.checkout?.shippingAddress?.phone,
      address: {
        first_name:
          shopifyEvent.data?.checkout?.shippingAddress?.firstName ||
          init.data.customer?.firstName ||
          null,
        last_name:
          shopifyEvent.data?.checkout?.shippingAddress?.lastName ||
          init.data.customer?.lastName ||
          null,
        street: shopifyEvent.data?.checkout?.shippingAddress?.address1 || null,
        city: shopifyEvent.data?.checkout?.shippingAddress?.city || null,
        region: shopifyEvent.data?.checkout?.shippingAddress?.province || null,
        postal_code: shopifyEvent.data?.checkout?.shippingAddress?.zip || null,
        country: shopifyEvent.data?.checkout?.shippingAddress?.country || null,
      },
    };

    console.log("User Data:", user_data);
    console.log(
      "Shipping Address:",
      shopifyEvent.data?.checkout?.shippingAddress
    );
    return { user_data };
  }
}

function pageLocation(shopifyEvent) {
  return {
    page_location: shopifyEvent.context.document.location.href,
    page_title: shopifyEvent.context.document.title,
  };
}

function id(shopifyEvent) {
  return {
    id: shopifyEvent.id,
  };
}

function searchTerm(shopifyEvent) {
  if (shopifyEvent.data?.searchResult) {
    return {
      search_term: shopifyEvent.data.searchResult.query,
    };
  }
  return {};
}

function ecommerceFromCartLine(shopifyEvent) {
  return {
    ecommerce: {
      currency: shopifyEvent.data.cartLine.cost.totalAmount.currencyCode,
      value: shopifyEvent.data.cartLine.cost.totalAmount.amount,
      items: [
        {
          item_id: shopifyEvent.data.cartLine.merchandise.sku,
          item_name: shopifyEvent.data.cartLine.merchandise.product.title,
          affiliation: "Online Store",
          //coupon
          //creative_name
          //creative_slot
          //discount
          index: 1,
          item_brand: shopifyEvent.data.cartLine.merchandise.product.vendor,
          item_category: shopifyEvent.data.cartLine.merchandise.product.type,
          //item_category2
          //item_category3
          //item_category4
          //item_category5
          //item_list_id
          //item_list_name
          item_variant: shopifyEvent.data.cartLine.merchandise.title,
          //location_id
          price: shopifyEvent.data.cartLine.merchandise.price.amount,
          //promotion_id
          //promotion_name
          quantity: shopifyEvent.data.cartLine.quantity,
          item_list_id: window.sessionStorage.getItem("itemListId"),
          item_list_name: window.sessionStorage.getItem("itemListName"),
          item_family:
            shopifyEvent.data.cartLine.merchandise.product.title.split(" ")[0],
        },
      ],
    },
  };
}

async function ecommerceFromCheckout(shopifyEvent) {
  const items = shopifyEvent.data.checkout.lineItems.map((item, index) => {
    return {
      item_id: item.variant.sku,
      item_name: item.title,
      affiliation: "Online Store",
      coupon: item.discountAllocations.reduce((acc, curr) => {
        return `${acc}+${curr.discountApplication.title}`;
      }, ""),
      discount: item.discountAllocations.reduce(
        (acc, curr) => acc + curr.amount.amount,
        0
      ),
      index,
      item_brand: item.variant.product.vendor,
      item_category: item.variant.product.type,
      item_variant: item.variant.title,
      price: item.variant.price.amount,
      quantity: item.quantity,
      item_list_id:
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("itemListId")
          : null,
      item_list_name:
        typeof window !== "undefined"
          ? window.sessionStorage.getItem("itemListName")
          : null,
      item_family: item.title.split(" ")[0],
    };
  });

  return {
    ecommerce: {
      currency: shopifyEvent.data.checkout.currencyCode,
      value: shopifyEvent.data.checkout.subtotalPrice.amount,
      transaction_id: shopifyEvent.data.checkout.order.id,
      coupon: shopifyEvent.data.checkout.discountApplications.reduce(
        (acc, curr) => {
          return `${acc}+${curr.title}`;
        },
        ""
      ),
      shipping: shopifyEvent.data.checkout.shippingLine.price.amount,
      tax: shopifyEvent.data.checkout.totalTax.amount,
      items: items,
    },
  };
}

function ecommerceFromCart(shopifyEvent) {
  return {
    ecommerce: {
      currency: shopifyEvent.data.cart.cost?.totalAmount.currencyCode,
      value: shopifyEvent.data.cart.cost?.totalAmount.amount,
      items: shopifyEvent.data.cart.lines.map((cartLine, index) => {
        return {
          item_id: cartLine.merchandise.sku,
          item_name: cartLine.merchandise.product.title,
          affiliation: "Online Store",
          //coupon
          //creative_name
          //creative_slot
          //discount
          index,
          item_brand: cartLine.merchandise.product.vendor,
          item_category: cartLine.merchandise.product.type,
          //item_category2
          //item_category3
          //item_category4
          //item_category5
          //item_list_id
          //item_list_name
          item_variant: cartLine.merchandise.title,
          //location_id
          price: cartLine.merchandise.price.amount,
          //promotion_id
          //promotion_name
          quantity: cartLine.quantity,
          item_list_id: window.sessionStorage.getItem("itemListId"),
          item_list_name: window.sessionStorage.getItem("itemListName"),
          item_family: cartLine.merchandise.product.title.split(" ")[0],
        };
      }),
    },
  };
}

async function ecommerceFromProductVariant(shopifyEvent) {
  return {
    ecommerce: {
      currency: shopifyEvent.data.productVariant.price.currencyCode,
      value: shopifyEvent.data.productVariant.price.amount,
      items: [
        {
          item_id: shopifyEvent.data.productVariant.sku,
          item_name: shopifyEvent.data.productVariant.product.title,
          affiliation: "Online Store",
          //coupon
          //creative_name
          //creative_slot
          //discount
          index: 1,
          item_brand: shopifyEvent.data.productVariant.product.vendor,
          item_category: shopifyEvent.data.productVariant.product.type,
          //item_category2
          //item_category3
          //item_category4
          //item_category5
          //item_list_id
          //item_list_name
          item_variant: shopifyEvent.data.productVariant.title,
          //location_id
          price: shopifyEvent.data.productVariant.price.amount,
          //promotion_id
          //promotion_name
          quantity: 1,
          item_list_id: window.sessionStorage.getItem("itemListId"),
          item_list_name: window.sessionStorage.getItem("itemListName"),
          item_family:
            shopifyEvent.data.productVariant.product.title.split(" ")[0],
        },
      ],
    },
  };
}

function ecommerceFromCollection(shopifyEvent) {
  let itemListId = shopifyEvent.data.collection.id;
  let itemListName = shopifyEvent.data.collection.title;
  sessionStorage.setItem("itemListId", itemListId);
  sessionStorage.setItem("itemListName", itemListName);
  return {
    ecommerce: {
      item_list_id: shopifyEvent.data.collection.id,
      item_list_name: shopifyEvent.data.collection.title,
      items: shopifyEvent.data.collection.productVariants.map(
        (variant, index) => {
          return {
            item_id: variant.sku,
            item_name: variant.product.title,
            affiliation: "Online Store",
            //coupon
            //creative_name
            //creative_slot
            //discount
            index,
            item_brand: variant.product.vendor,
            item_category: variant.product.type,
            //item_category2
            //item_category3
            //item_category4
            //item_category5
            item_variant: variant.title,
            //location_id
            price: variant.price.amount,
            //promotion_id
            //promotion_name
            quantity: 1,
            item_list_id: shopifyEvent.data.collection.id,
            item_list_name: shopifyEvent.data.collection.title,
            item_family: variant.product.title.split(" ")[0],
          };
        }
      ),
    },
  };
}

function ecommerceFromSearchResult(shopifyEvent) {
  sessionStorage.setItem("itemListId", "Search");
  sessionStorage.setItem("itemListName", "Search");
  return {
    ecommerce: {
      items: shopifyEvent.data.searchResult.productVariants.map(
        (variant, index) => {
          return {
            item_id: variant.sku,
            item_name: variant.product.title,
            affiliation: "Online Store",
            //coupon
            //creative_name
            //creative_slot
            //discount
            index,
            item_brand: variant.product.vendor,
            item_category: variant.product.type,
            //item_category2
            //item_category3
            //item_category4
            //item_category5
            item_variant: variant.title,
            //location_id
            price: variant.price.amount,
            //promotion_id
            //promotion_name
            quantity: 1,
            item_list_id: window.sessionStorage.getItem("itemListId"),
            item_list_name: window.sessionStorage.getItem("itemListName"),
            item_family: variant.product.title.split(" ")[0],
          };
        }
      ),
    },
  };
}

async function ecommerce(shopifyEvent) {
  if (shopifyEvent.data?.cart) {
    return ecommerceFromCart(shopifyEvent);
  }

  if (shopifyEvent.data?.checkout) {
    return await ecommerceFromCheckout(shopifyEvent);
  }

  if (shopifyEvent.data?.cartLine) {
    return ecommerceFromCartLine(shopifyEvent);
  }

  if (shopifyEvent.data?.productVariant) {
    return await ecommerceFromProductVariant(shopifyEvent);
  }

  if (shopifyEvent.data?.collection) {
    return ecommerceFromCollection(shopifyEvent);
  }

  if (shopifyEvent.data?.searchResult) {
    return ecommerceFromSearchResult(shopifyEvent);
  }

  return {};
}

function customData(shopifyEvent) {
  if (!isObject(shopifyEvent?.customData)) return {};
  return {
    ...shopifyEvent.customData,
  };
}

function eventName(shopifyEvent) {
  const shopifyStandardEventToGtagEventsMap = {
    checkout_completed: "purchase",
    payment_info_submitted: "add_payment_info",
    checkout_shipping_info_submitted: "add_shipping_info",
    checkout_started: "begin_checkout",
    product_added_to_cart: "add_to_cart",
    cart_viewed: "view_cart",
    page_viewed: "page_viewed",
    product_viewed: "view_item",
    search_submitted: "search",
    collection_viewed: "view_item_list",
  };

  const event =
    shopifyStandardEventToGtagEventsMap[shopifyEvent.name] || shopifyEvent.name;

  return {
    event,
  };
}

function ignoreReferrer(shopifyEvent) {
  if (isCheckout) {
    return {
      ignore_referrer: "true",
    };
  }
  return {};
}

async function shopifyEventToDataLayerEventAdapter(shopifyEvent) {
  return {
    ...eventName(shopifyEvent),
    ...ignoreReferrer(shopifyEvent),
    ...id(shopifyEvent),
    ...searchTerm(shopifyEvent),
    ...pageLocation(shopifyEvent),
    ...timestamp(shopifyEvent),
    ...userData(shopifyEvent),
    ...(await ecommerce(shopifyEvent)),
    ...customData(shopifyEvent),
  };
}

function sendDataLayerEvent(event) {
  dataLayer.push({ ecommerce: null });
  dataLayer.push(event);
  console.log(dataLayer);
}

async function generalEventsHandler(shopifyEvent) {
  const event = await shopifyEventToDataLayerEventAdapter(shopifyEvent);
  sendDataLayerEvent(event);
}

analytics.subscribe("all_standard_events", generalEventsHandler);
analytics.subscribe("all_custom_events", generalEventsHandler);
