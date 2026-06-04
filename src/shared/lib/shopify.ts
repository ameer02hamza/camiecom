// ─── Shopify GraphQL Client ───────────────────────────────────────────────────
// Uses env variables — NO hardcoding

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_PUBLIC_TOKEN!
const VERSION = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION ?? '2026-04'
const ENDPOINT = `https://${DOMAIN}/api/${VERSION}/graphql.json`

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'no-store',
}: {
  query: string
  variables?: Record<string, unknown>
  cache?: RequestCache
}): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache,
  })

  if (!res.ok) throw new Error(`Shopify API error: ${res.status}`)

  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data as T
}

// ─── AUTH MUTATIONS ────────────────────────────────────────────────────────────

export const CUSTOMER_REGISTER = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
        acceptsMarketing
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`

export const CUSTOMER_LOGIN = `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`

export const CUSTOMER_LOGOUT = `
  mutation customerAccessTokenDelete($customerAccessToken: String!) {
    customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
      deletedAccessToken
      userErrors {
        field
        message
      }
    }
  }
`

export const GET_CUSTOMER = `
  query getCustomer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      id firstName lastName email phone acceptsMarketing
      defaultAddress { id }
    }
  }
`

// ─── NEWSLETTER ───────────────────────────────────────────────────────────────

export const NEWSLETTER_SUBSCRIBE = `
  mutation newsletterSubscribe($email: String!, $password: String!) {
    customerCreate(input: { email: $email, password: $password, acceptsMarketing: true }) {
      customer { id email acceptsMarketing }
      customerUserErrors { code field message }
    }
  }
`

export const GET_PRODUCTS = `
  query GetProducts($first: Int!, $after: String, $sortKey: ProductSortKeys, $reverse: Boolean) {
    products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
      pageInfo { hasNextPage endCursor }
      edges { node {
        id handle title
        priceRange { minVariantPrice { amount currencyCode } }
        compareAtPriceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText width height }
        tags
        variants(first: 10) { edges { node {
          id title availableForSale
          price { amount currencyCode }
          selectedOptions { name value }
        }}}
      }}
    }
  }
`

export const GET_PRODUCT = `
  query GetProduct($handle: String!) {
    product(handle: $handle) {
      id handle title description
      priceRange { minVariantPrice { amount currencyCode } }
      compareAtPriceRange { minVariantPrice { amount currencyCode } }
      images(first: 10) { edges { node { url altText width height } } }
      variants(first: 100) { edges { node {
        id title availableForSale
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        image { url altText width height }
      }}}
      options { id name values }
      seo { title description }
    }
  }
`

export const GET_COLLECTIONS = `
  query GetCollections($first: Int!) {
    collections(first: $first) {
      edges { node {
        id handle title description
        image { url altText }
      }}
    }
  }
`

export const GET_COLLECTION_PRODUCTS = `
  query GetCollectionProducts($handle: String!, $first: Int!, $after: String, $sortKey: ProductCollectionSortKeys, $reverse: Boolean) {
    collection(handle: $handle) {
      id handle title description
      image { url altText }
      products(first: $first, after: $after, sortKey: $sortKey, reverse: $reverse) {
        pageInfo { hasNextPage endCursor }
        edges { node {
          id handle title
          priceRange { minVariantPrice { amount currencyCode } }
          compareAtPriceRange { minVariantPrice { amount currencyCode } }
          featuredImage { url altText width height }
          tags
          options { id name values }
          variants(first: 10) { edges { node {
            id title availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
          }}}
        }}
      }
    }
  }
`

export const GET_CART = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      id checkoutUrl
      lines(first: 100) { edges { node {
        id quantity
        merchandise { ... on ProductVariant {
          id title price { amount currencyCode }
          product { title handle featuredImage { url altText } }
        }}
      }}}
      cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
    }
  }
`

export const CREATE_CART = `
  mutation CreateCart($lines: [CartLineInput!]) {
    cartCreate(input: { lines: $lines }) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title price { amount currencyCode }
            product { title handle featuredImage { url altText } }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      }
    }
  }
`

export const ADD_TO_CART = `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title price { amount currencyCode }
            product { title handle featuredImage { url altText } }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      }
    }
  }
`

export const UPDATE_CART_LINE = `
  mutation UpdateCartLine($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title price { amount currencyCode }
            product { title handle featuredImage { url altText } }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      }
    }
  }
`

export const REMOVE_CART_LINE = `
  mutation RemoveCartLine($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        id checkoutUrl
        lines(first: 100) { edges { node {
          id quantity
          merchandise { ... on ProductVariant {
            id title price { amount currencyCode }
            product { title handle featuredImage { url altText } }
          }}
        }}}
        cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
      }
    }
  }
`

export const UPDATE_BUYER_IDENTITY = `
  mutation UpdateBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
          phone
          deliveryAddressPreferences {
            ... on MailingAddress {
              firstName lastName address1 city province zip countryCodeV2
            }
          }
        }
      }
      userErrors { field message }
    }
  }
`

export const CUSTOMER_UPDATE = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer { id firstName lastName email phone acceptsMarketing }
      customerUserErrors { code field message }
    }
  }
`

export const CUSTOMER_RECOVER = `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors { code field message }
    }
  }
`

export const GET_CUSTOMER_ADDRESSES = `
  query GetCustomerAddresses($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      defaultAddress { id }
      addresses(first: 20) { edges { node {
        id firstName lastName address1 address2 city province zip country phone
      }}}
    }
  }
`

export const ADDRESS_CREATE = `
  mutation customerAddressCreate($customerAccessToken: String!, $address: MailingAddressInput!) {
    customerAddressCreate(customerAccessToken: $customerAccessToken, address: $address) {
      customerAddress { id firstName lastName address1 address2 city province zip country phone }
      customerUserErrors { code field message }
    }
  }
`

export const ADDRESS_UPDATE = `
  mutation customerAddressUpdate($customerAccessToken: String!, $id: ID!, $address: MailingAddressInput!) {
    customerAddressUpdate(customerAccessToken: $customerAccessToken, id: $id, address: $address) {
      customerAddress { id firstName lastName address1 address2 city province zip country phone }
      customerUserErrors { code field message }
    }
  }
`

export const ADDRESS_DELETE = `
  mutation customerAddressDelete($customerAccessToken: String!, $id: ID!) {
    customerAddressDelete(customerAccessToken: $customerAccessToken, id: $id) {
      deletedCustomerAddressId
      customerUserErrors { code field message }
    }
  }
`

export const ADDRESS_SET_DEFAULT = `
  mutation customerDefaultAddressUpdate($customerAccessToken: String!, $addressId: ID!) {
    customerDefaultAddressUpdate(customerAccessToken: $customerAccessToken, addressId: $addressId) {
      customer { defaultAddress { id } }
      customerUserErrors { code field message }
    }
  }
`

export const GET_CUSTOMER_ORDERS = `
  query GetOrders($customerAccessToken: String!, $first: Int!, $after: String) {
    customer(customerAccessToken: $customerAccessToken) {
      orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
        pageInfo { hasNextPage endCursor }
        edges { node {
          id orderNumber processedAt financialStatus fulfillmentStatus
          currentTotalPrice { amount currencyCode }
          lineItems(first: 5) { edges { node {
            title quantity
            variant { image { url } price { amount currencyCode } }
          }}}
        }}
      }
    }
  }
`
