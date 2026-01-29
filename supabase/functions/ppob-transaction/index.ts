// Follow this guide to deploy: https://supabase.com/docs/guides/functions/deploy
// Command: supabase functions deploy ppob-transaction

// Declare Deno to fix "Cannot find name 'Deno'" error in non-Deno environments or missing types
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// @ts-ignore
import md5 from "https://esm.sh/md5"

serve(async (req) => {
  try {
    // 1. Initialize Supabase Admin Client to fetch secrets from DB
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch API Keys from 'app_configs' table (SECURE)
    const { data: configData, error: configError } = await supabaseClient
      .from('app_configs')
      .select('value')
      .eq('key', 'ppob')
      .single()

    if (configError || !configData) throw new Error("PPOB Configuration not found")
    
    const config = configData.value
    const { username, apiKey, mode, provider } = config
    const isProd = mode === 'production'

    // 3. Parse Request
    const { action, sku, customerNo, refId } = await req.json()

    // 4. Handle DIGIFLAZZ Logic
    if (provider === 'digiflazz') {
      const baseUrl = isProd ? 'https://api.digiflazz.com/v1' : 'https://api.digiflazz.com/v1'
      
      if (action === 'check_price') {
        // Digiflazz Price Check
        const signature = md5(username + apiKey + "depo").toString()
        const payload = {
          cmd: "deposit", // Checking balance/price list often uses deposit/pricelist cmd
          username,
          sign: signature
        }
        
        // Note: Real implementation depends on specific Digiflazz endpoint for price checking
        // Often 'pricelist' or 'deposit' check. Assuming a generic call here.
        const response = await fetch(`${baseUrl}/price-list`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cmd: "prepaid", username, sign: md5(username + apiKey + "pricelist").toString() })
        })
        const result = await response.json()
        return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
      }

      if (action === 'transaction') {
        // Digiflazz Transaction
        const signature = md5(username + apiKey + refId).toString()
        const payload = {
          username,
          buyer_sku_code: sku,
          customer_no: customerNo,
          ref_id: refId,
          sign: signature
        }

        const response = await fetch(`${baseUrl}/transaction`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        const result = await response.json()
        return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
      }
    }

    return new Response(JSON.stringify({ error: "Provider not implemented" }), { status: 400 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})