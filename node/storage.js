const fs = require('fs');

const counterFile = 'counter.json';
const guestsFile = 'guests.json';
const ipStatsFile = 'ipstats.json';

function loadCounter() {
  if (!fs.existsSync(counterFile)) return 0;
  try {
    const data = JSON.parse(fs.readFileSync(counterFile, 'utf-8'));
    return data.all || 0;
  } catch {
    return 0;
  }
}

function saveCounter(counter) {
  fs.writeFileSync(counterFile, JSON.stringify({ all: counter }));
}

function loadGuests() {
  if (!fs.existsSync(guestsFile)) return [];
  try {
    return JSON.parse(fs.readFileSync(guestsFile, 'utf-8'));
  } catch {
    return [];
  }
}

function saveGuests(guests) {
  fs.writeFileSync(guestsFile, JSON.stringify(guests, null, 2));
}

function loadIpStats() {
  if (!fs.existsSync(ipStatsFile)) return {};
  try {
    return JSON.parse(fs.readFileSync(ipStatsFile, 'utf-8'));
  } catch {
    return {};
  }
}

function saveIpStats(ipStats) {
  fs.writeFileSync(ipStatsFile, JSON.stringify(ipStats));
}

module.exports = {
  loadCounter,
  saveCounter,
  loadGuests,
  saveGuests,
  loadIpStats,
  saveIpStats,
};
