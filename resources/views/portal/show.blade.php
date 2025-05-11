<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patient Portal - {{ $patient->name }}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-3xl font-bold text-gray-900">Patient Portal</h1>
            <p class="text-gray-500">View your hospital records and billing information</p>
        </div>
        
        <!-- Patient Info -->
        <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Patient Information</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Name</p>
                    <p class="text-lg font-medium">{{ $patient->name }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Room</p>
                    <p class="text-lg font-medium">{{ $patient->room_number }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Ward Type</p>
                    <p class="text-lg font-medium capitalize">{{ $patient->ward_type }}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Admission Date</p>
                    <p class="text-lg font-medium">
                        {{ $admission->created_at->format('M d, Y') }}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Attending Physician</p>
                    <p class="text-lg font-medium">{{ $patient->attending_physician }}</p>
                </div>
            </div>
        </div>

        <!-- Progress Bill -->
        <div class="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900">Current Progress Bill</h2>
                <a 
                    href="{{ route('billing.progress.download', ['id' => $admission->id]) }}" 
                    target="_blank" 
                    class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <svg class="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download PDF
                </a>
            </div>
            
            @if($billings->count() > 0)
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                    Date
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                    Category
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                    Description
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($billings as $billing)
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ $billing->created_at->format('M d, Y') }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                                        {{ str_replace('_', ' ', $billing->category) }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        {{ $billing->description }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        ₱{{ number_format($billing->amount, 2) }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="px-6 py-4 text-sm font-bold text-gray-900">
                                    Current Total
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                    ₱{{ number_format($total, 2) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            @else
                <p class="text-gray-500 italic">No charges found</p>
            @endif
        </div>

        <!-- Statement of Account -->
        <div class="bg-white shadow-sm rounded-lg p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900">Statement of Account</h2>
                <a 
                    href="{{ route('billing.soa.download', ['id' => $admission->id]) }}" 
                    target="_blank" 
                    class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download SOA
                </a>
            </div>
            
            @if($billings->count() > 0)
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                    Bill Date
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">
                                    Description
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th class="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($billings as $billing)
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ $billing->created_at->format('M d, Y') }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        {{ $billing->description }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        ₱{{ number_format($billing->amount, 2) }}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-center">
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            @if($billing->status === 'paid')
                                                bg-green-100 text-green-800
                                            @elseif($billing->status === 'pending')
                                                bg-yellow-100 text-yellow-800
                                            @else
                                                bg-red-100 text-red-800
                                            @endif">
                                            {{ ucfirst($billing->status) }}
                                        </span>
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" class="px-6 py-4 text-sm font-bold text-gray-900">
                                    Total Balance
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                    ₱{{ number_format($pendingTotal, 2) }}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            @else
                <p class="text-gray-500 italic">No charges found</p>
            @endif
        </div>
        
        <!-- Summary Section -->
        <div class="bg-white shadow-sm rounded-lg p-6 mt-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-blue-50 p-4 rounded-lg">
                    <p class="text-sm text-blue-600 mb-1">Total Charges</p>
                    <p class="text-2xl font-bold text-blue-800">₱{{ number_format($total, 2) }}</p>
                </div>
                
                <div class="bg-green-50 p-4 rounded-lg">
                    <p class="text-sm text-green-600 mb-1">Amount Paid</p>
                    <p class="text-2xl font-bold text-green-800">₱{{ number_format($paidTotal, 2) }}</p>
                </div>
                
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <p class="text-sm text-yellow-600 mb-1">Balance Due</p>
                    <p class="text-2xl font-bold text-yellow-800">₱{{ number_format($pendingTotal, 2) }}</p>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="mt-8 text-center text-gray-500 text-sm">
            <p>If you have any questions about your bill, please contact our billing department.</p>
            <p class="mt-2">&copy; {{ date('Y') }} Hospital Billing System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>