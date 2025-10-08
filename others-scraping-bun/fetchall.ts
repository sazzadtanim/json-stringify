process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import fs from "fs";

const baseURL =
  "https://mocat.gov.bd/api/datatable/go_ultimate_view.php?domain_id=6490&categoryName=%E0%A6%AC%E0%A6%BF%E0%A6%A6%E0%A7%87%E0%A6%B6***%E0%A6%B8%E0%A6%AB%E0%A6%B0***%E0%A6%93***%E0%A6%9F%E0%A7%8D%E0%A6%B0%E0%A7%87%E0%A6%A8%E0%A6%BF%E0%A6%82***%E0%A6%B8%E0%A6%82%E0%A6%95%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%A8%E0%A7%8D%E0%A6%A4***%E0%A6%9C%E0%A6%BF%E0%A6%93&lang=bn&subdomain=mocat.portal.gov.bd&content_type=go_ultimate";

const headers = {
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-Requested-With": "XMLHttpRequest",
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
};

async function fetchPage(start, length = 100) {
  const body = new URLSearchParams({
    sEcho: "2",
    iColumns: "6",
    sColumns: ",,,,,",
    iDisplayStart: String(start),
    iDisplayLength: String(length),
    mDataProp_0: "0",
    bSearchable_0: "true",
    mDataProp_1: "1",
    bSearchable_1: "true",
    mDataProp_2: "2",
    bSearchable_2: "true",
    mDataProp_3: "3",
    bSearchable_3: "true",
    mDataProp_4: "4",
    bSearchable_4: "true",
    mDataProp_5: "5",
    bSearchable_5: "true",
    sSearch: "",
    bRegex: "false",
  });

  const res = await fetch(baseURL, {
    method: "POST",
    headers,
    body,
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const data = await res.json();
  return data?.aaData ?? data?.data ?? [];
}

async function main() {
  let allRecords = [];
  let start = 0;
  const length = 100;

  while (true) {
    console.log(`Fetching records ${start}–${start + length}...`);
    const page = await fetchPage(start, length);
    if (page.length === 0) break;

    allRecords.push(...page);
    if (page.length < length) break;

    start += length;
  }

  console.log(`✅ Fetched total ${allRecords.length} records`);
  fs.writeFileSync("records.json", JSON.stringify(allRecords, null, 2));
}

main().catch(console.error);
