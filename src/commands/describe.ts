export async function describe(url: string, globalOpts: any, logger: any) {
  const res = await fetch(url);
  let body: any = {};
  try {
    body = await res.json();
  } catch {
    body = {};
  }
  if (globalOpts.json) {
    // Emit structured error when server does not provide PaymentRequirements
    if (res.status !== 402) console.log(JSON.stringify({ error: 'no_payment_required', status: res.status }));
    else console.log(JSON.stringify(body));
  } else {
    if (res.status !== 402) {
      console.log('Server did not request payment (status:', res.status + ')');
    } else {
      console.log('PaymentRequirements v1');
      console.log(JSON.stringify(body, null, 2));
    }
  }
}