import { test, expect } from 'playwright-test-coverage';
import { Page } from "@playwright/test";
import {Role, User} from "../src/service/pizzaService";

test('home page', async ({ page }) => {
  await page.goto('/');

  expect(await page.title()).toBe('JWT Pizza');
});

async function basicInitAdmin(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'a@jwt.com': { id: '4', name: 'a', email: 'a@jwt.com', password: 'admin', roles: [{ role: Role.Admin }] }};

  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

 

  // create a new franchise
  await page.route("*/**/api/franchise", async (route) => {
  expect(route.request().method()).toBe("POST");
  await route.fulfill({
    json: { id: 123, name: "good morning" },
  });
   
  });

  // Close (delete) a franchise
  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
    expect(route.request().method()).toBe("DELETE");
    
    // You can read the franchise ID from the URL if needed
    const url = route.request().url();
    const id = url.split("/").pop();
    console.log(`Mock: deleting franchise ${id}`);

    await route.fulfill({
      json: { message: `Franchise ${id} closed successfully` },
    });
  });

  await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async (route) => {
  expect(route.request().method()).toBe("DELETE");

  const parts = route.request().url().split("/");
  const franchiseId = parts[parts.length - 3];
  const storeId = parts[parts.length - 1];
  console.log(`Mock: deleting store ${storeId} from franchise ${franchiseId}`);

  await route.fulfill({
    json: { message: `Store ${storeId} from franchise ${franchiseId} deleted successfully` },
  });
});


  await page.goto('/');
}

async function basicInitFranchise(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'f@jwt.com': { id: '2', name: 'pizza franchisee', email: 'f@jwt.com', password: 'franchisee', roles:[
      {
        role: Role.Diner
      },
      {
        objectId: "1",
        role: Role.Franchisee
      }
    ] }};

    // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
    const loginReq = route.request().postDataJSON();
    const user = validUsers[loginReq.email];
    if (!user || user.password !== loginReq.password) {
      await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
      return;
    }
    loggedInUser = validUsers[loginReq.email];
    const loginRes = {
      user: loggedInUser,
      token: 'abcdef',
    };
    expect(route.request().method()).toBe('PUT');
    await route.fulfill({ json: loginRes });
  });

  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise\/\d+(\?.*)?\/?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  await page.goto('/');
}


async function basicInitDiner(page: Page) {
  let loggedInUser: User | undefined;
  const validUsers: Record<string, User> = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] }};

  await page.route('**/logout', async (route) => {
  loggedInUser = undefined; // clear the logged-in user
  await route.fulfill({ status: 200, body: 'Logged out' });
  });
  // Authorize login for the given user
  await page.route('*/**/api/auth', async (route) => {
  const loginReq = route.request().postDataJSON();
  if (!loginReq || !loginReq.email) {
    // Not a login request; let it continue or fail gracefully
    await route.continue();
    return;
  }

  const user = validUsers[loginReq.email];
  if (!user || user.password !== loginReq.password) {
    await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
    return;
  }

  loggedInUser = user;
  const loginRes = {
    user: loggedInUser,
    token: 'abcdef',
  };
  expect(route.request().method()).toBe('PUT');
  await route.fulfill({ json: loginRes });
});


  // Return the currently logged in user
  await page.route('*/**/api/user/me', async (route) => {
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: loggedInUser });
  });

  // A standard menu
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      {
        id: 1,
        title: 'Veggie',
        image: 'pizza1.png',
        price: 0.0038,
        description: 'A garden of delight',
      },
      {
        id: 2,
        title: 'Pepperoni',
        image: 'pizza2.png',
        price: 0.0042,
        description: 'Spicy treat',
      },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  // Standard franchises and stores
  await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
    const franchiseRes = {
      franchises: [
        {
          id: 2,
          name: 'LotaPizza',
          stores: [
            { id: 4, name: 'Lehi' },
            { id: 5, name: 'Springville' },
            { id: 6, name: 'American Fork' },
          ],
        },
        { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
        { id: 4, name: 'topSpot', stores: [] },
      ],
    };
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  // Order a pizza.
  await page.route('*/**/api/order', async (route) => {
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    await route.fulfill({ json: orderRes });
  });

  // Get previous orders
await page.route('*/**/api/order', async (route) => {
  if (route.request().method() === 'GET') {
    const previousOrdersRes = [
      {
        id: 21,
        title: 'Veggie',
        price: 0.0038,
        description: 'A garden of delight',
        date: '2025-10-01T15:42:00Z',
      },
      {
        id: 22,
        title: 'Pepperoni',
        price: 0.0042,
        description: 'Spicy treat',
        date: '2025-10-05T19:13:00Z',
      },
    ];
    await route.fulfill({ json: previousOrdersRes });
  } else if (route.request().method() === 'POST') {
    // Handle placing a new order (your existing logic)
    const orderReq = route.request().postDataJSON();
    const orderRes = {
      order: { ...orderReq, id: 23 },
      jwt: 'eyJpYXQ',
    };
    await route.fulfill({ json: orderRes });
  } else {
    // Optional: handle unexpected methods gracefully
    await route.fulfill({ status: 405, json: { error: 'Method not allowed' } });
  }
});

  await page.route(/\/api\/franchise\/\d+$/, async (route) => {
  expect(route.request().method()).toBe("GET");

  // Extract the ID from the URL
  const id = Number(route.request().url().split("/").pop());

  const franchiseDetail = {
    id,
    name: "LotaPizza",
    stores: [
      { id: 4, name: "Lehi" },
      { id: 5, name: "Springville" },
      { id: 6, name: "American Fork" },
    ],
  };

  await route.fulfill({ json: franchiseDetail });
});


  await page.goto('/');
}

test('login', async ({ page }) => {
  await basicInitDiner(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('logout', async ({ page }) => {
  await basicInitDiner(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('dinerDashboard', async ({ page }) => {
  await basicInitDiner(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('a');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByText('KC').click();
});


test('loginF', async ({ page }) => {
  await basicInitFranchise(page);
  //await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();

  await page.waitForTimeout(1000);
  await page.getByRole('link', { name: 'History' }).click();
  await page.getByRole('link', { name: 'About' }).click();

  // await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
  await basicInitDiner(page);

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();


  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});


test('create/delete store', async ({ page }) => {
  await basicInitFranchise(page);
  //await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('franchisee');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(1000);
  // await page.getByText('pf').click();
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  // await page.waitForTimeout(1000);
  // await page.getByRole('button', { name: 'Close' }).nth(1).click();
  // await page.getByRole('button', { name: 'Close' }).click();
  // await page.getByRole('button', { name: 'Create store' }).click();
  // await page.getByRole('textbox', { name: 'store name' }).click();
  // await page.getByRole('textbox', { name: 'store name' }).fill('hello again');
  // await page.getByRole('button', { name: 'Create' }).click();
});






test('register', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).click();
  await page.getByRole('textbox', { name: 'Full name' }).fill('hi');
  await page.getByRole('textbox', { name: 'Full name' }).press('Tab');
  await page.getByRole('textbox', { name: 'Email address' }).fill('hi@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('hi');
  await page.getByRole('button', { name: 'Register' }).click();
});


test('admin add franchise', async ({ page }) => {
  await basicInitAdmin(page);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Email address' }).press('Tab');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).click();
  await page.getByRole('textbox', { name: 'franchise name' }).fill('good morning');
  await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
  await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('gm@jwt.com');
  await page.getByRole('button', { name: 'Create' }).click();
});

test('admin delete store', async ({ page }) => {
  await basicInitAdmin(page);

  // Login as admin
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to Admin > Franchise
  await page.getByRole('link', { name: 'Admin' }).click();

  // Click the Delete button for a store
  // Adjust selector to match your UI
  // Delete the first store under LotaPizza
  await page.locator('tr:has(td:has-text("Lehi")) button:has-text("Close")').click();

  await page.getByRole('button', { name: 'Close' }).click();
});

test('admin delete franchise', async ({ page }) => {
  await basicInitAdmin(page);

  // Login as admin
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();

  // await page.getByText('a').click();

  // Navigate to Admin > Franchise
  await page.getByRole('link', { name: 'Admin' }).click();

  // // Wait for table to render
  await page.waitForSelector('table');

  // // Delete the franchise row (e.g., LotaPizza)
  // // This targets the top-level row with "LotaPizza"
  await page.locator('tr:has-text("LotaPizza") button:has-text("Close")').first().click();

  // // Confirm deletion if a confirmation modal appears
  // // (skip if your UI deletes immediately)
  await page.getByRole('button', { name: 'Close' }).click();
  
});
