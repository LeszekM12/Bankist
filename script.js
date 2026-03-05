'use strict';

// BANKIST APP

// Data
const account1 = {
  owner: 'Leszek Mikrut',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2026-11-18T21:31:17.178Z',
    '2026-12-23T07:42:02.383Z',
    '2026-01-28T09:15:04.904Z',
    '2026-04-01T10:17:24.185Z',
    '2026-05-08T14:11:59.604Z',
    '2026-03-03T17:01:17.194Z',
    '2026-03-04T23:36:17.929Z',
    '2026-03-05T10:51:36.790Z'
  ],
  currency: 'EUR',
  locale: 'pt-PT' // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2026-11-01T13:15:33.035Z',
    '2026-11-30T09:48:16.867Z',
    '2026-12-25T06:04:23.907Z',
    '2026-01-25T14:18:46.235Z',
    '2026-02-05T16:33:06.386Z',
    '2026-04-10T14:43:26.374Z',
    '2026-06-25T18:49:59.371Z',
    '2026-07-26T12:01:20.894Z'
  ],
  currency: 'USD',
  locale: 'en-US'
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

let currentAccount;

const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

const formatCur = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
}

const displayMovements = (account, sort = false) => {
  containerMovements.innerHTML = '';

  const combinedMovesDates = account.movements.map((mov, i) =>
    ({
      movement: mov,
      movementDate: account.movementsDates.at(i)
    }));

  if (sort) combinedMovesDates.sort((a, b) => a.movement - b.movement);

  // const moves = sort ? account.movements.slice().sort((a, b) => a - b) : account.movements;

  combinedMovesDates.forEach((obj, i) => {
    const { movement, movementDate } = obj;

    const type = movement > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(movementDate);
    const displayDate = formatMovementDate(date, account.locale);

    const formattedMov = formatCur(movement, account.locale, account.currency);

    const html = `
      <div class="movements">
        <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
       </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);

  });
};


const calcDisplayBalance = account => {
  account.balance = account.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = formatCur(account.balance, account.locale, account.currency)};


const calcDisplaySummary = account => {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumIn.textContent = formatCur(incomes, account.locale, account.currency);

  const outcomes = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0)
  labelSumOut.textContent = formatCur(Math.abs(outcomes), account.locale, account.currency);

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * account.interestRate / 100)
    .filter(mov => mov > 1)
    .reduce((acc, int) => acc + int, 0)
    .toFixed(2);
  labelSumInterest.textContent = formatCur(interest, account.locale, account.currency);
}

const createUsernames = accounts => {
  accounts.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = (currentAccount) => {
  displayMovements(currentAccount);
  calcDisplayBalance(currentAccount);
  calcDisplaySummary(currentAccount);
};

// Always logged in
currentAccount = account1;
updateUI(currentAccount);
containerApp.style.opacity = 1;


// Event handler
btnLogin.addEventListener('click', (e) => {
  e.preventDefault();

  currentAccount = accounts
    .find(acc => acc.username === inputLoginUsername.value);
  // console.log(currentAccount);
  // Logging the user
  if (currentAccount?.pin === inputLoginPin.value * 1) {
    // Display UI and message
    containerApp.style.opacity = 1;

    const now = new Date()
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'short',
    }
    const locale = navigator.language;

    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);


    labelWelcome.textContent = `Welcome back ${currentAccount.owner.split(' ')[0]}`

    // Clear inputs
    inputLoginUsername.value = inputLoginPin.value = '';

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', (e) => {
  e.preventDefault();
  const amount = inputTransferAmount.value * 1;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferTo.value = inputTransferAmount.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', (e) => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
    inputLoanAmount.value = '';
  }
})

btnClose.addEventListener('click', (e) => {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    inputClosePin.value * 1 === currentAccount.pin
  ) {
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = 'Log in to get started'
  }
});

let sorted = false;
btnSort.addEventListener('click', (e) => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
})





