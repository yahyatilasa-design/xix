// Deploy: supabase functions deploy create-payment

// Declare Deno to fix "Cannot find name 'Deno'" error in non-Deno environments or missing types
declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch Config
    const { data: configData } = await supabaseClient
      .from('app_configs')
      .select('value')
      .eq('key', 'payment')
      .single()

    const config = configData?.value
    if (!config) throw new Error("Payment config missing")

    const { amount, description, userId, userEmail, userName, gateway } = await req.json()
    const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    if (gateway === 'midtrans') {
      const serverKey = config.serverKey
      const isProd = config.mode === 'production'
      const baseUrl = isProd ? 'https://app.midtrans.com/snap/v1/transactions' : 'https://app.sandbox.midtrans.com/snap/v1/transactions'

      // Base64 Encode Server Key
      const authString = btoa(serverKey + ':')

      const payload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount
        },
        credit_card: { secure: true },
        customer_details: {
          first_name: userName,
          email: userEmail
        },
        item_details: [{
            id: 'TOPUP',
            price: amount,
            quantity: 1,
            name: description
        }]
      }

      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()
      
      // Store pending transaction in DB
      await supabaseClient.from('transactions').insert({
        id: orderId, // using uuid usually, but for mapping we might store this in a 'reference_id' column
        user_id: userId,
        type: 'topup',
        amount: amount,
        status: 'pending',
        description: description
      })

      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: "Gateway not supported" }), { status: 400 })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})