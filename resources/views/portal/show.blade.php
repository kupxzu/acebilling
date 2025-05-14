<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Progress Bill - {{ $patient->name }}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Responsive Navbar -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-24"> <!-- Increased height from h-20 to h-24 -->
                <!-- Logo Section -->
                <div class="flex-shrink-0 flex items-center">
                    <img class="block h-20 w-auto" src="{{ asset('your-logo.png') }}" alt="Hospital Logo">
                    <div class="ml-3">
                        <span class="block text-2xl font-bold text-gray-900 hidden md:block">ACEMCT</span>
                        <span class="block text-sm text-gray-500 hidden md:block">ACE MEDICAL CENTER TUGUEGARAO</span>
                    </div>
                </div>

                <!-- Mobile menu button -->
                <div class="flex items-center md:hidden">
                    <button type="button" 
                            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            onclick="document.getElementById('mobile-menu').classList.toggle('hidden')"
                            aria-expanded="false">
                        <span class="sr-only">Open main menu</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex md:items-center md:space-x-4">
                    <span class="text-gray-900 text-lg font-semibold">ACE MEDICAL CENTER TUGUEGARAO</span>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Progress Bill Header -->
        <div class="mb-8">
            <br>
            <h1 class="text-5xl font-bold text-gray-900">TOTAL BILL<hr></h1>
        </div>
        
        <!-- Redesigned Patient Information -->
        <div class="bg-white shadow-lg rounded-xl p-6 mb-6">
            <div class="flex items-center gap-3 mb-6">
                <div class="p-2 bg-indigo-100 rounded-lg">
                    <svg class="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900">Patient Information</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Left Column -->
                <div class="bg-gray-50 p-4 rounded-lg">
                    <div class="text-sm text-gray-500 mb-1">Patient Name</div>
                    <div class="text-base font-semibold text-gray-900">{{ $patient->name }}</div>
                </div>

                <!-- Middle Column -->
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-500 mb-1">Room</div>
                        <div class="text-base font-semibold text-gray-900">{{ $admission->room_number }}</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-500 mb-1">Ward Type</div>
                        <div class="text-base font-semibold text-gray-900">{{ $admission->ward_type }}</div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-500 mb-1">Attending Physician</div>
                        <div class="text-base font-semibold text-gray-900">{{ $admission->attending_physician }}</div>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="text-sm text-gray-500 mb-1">Admission Date</div>
                        <div class="text-base font-semibold text-gray-900">{{ $admission->created_at->format('M d, Y') }}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Progress Bill Content -->
        <div class="bg-white shadow-lg rounded-lg p-6 mb-6">
            <div class="flex justify-between items-center mb-6">
                <div class="space-y-1">
                    <p class="text-sm text-gray-500">Bill Date</p>
                    <p class="text-lg font-medium">{{ now()->format('M d, Y') }}</p>
                </div>
                <div>
                    <a href="{{ route('billing.progress.download', ['id' => $admission->id]) }}" 
                       target="_blank" 
                       class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Bill
                    </a>
                </div>
            </div>

            @if($billings->count() > 0)
                <div class="overflow-hidden rounded-lg border border-gray-200">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            @foreach($billings as $billing)
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {{ $billing->created_at->format('M d, Y') }}
                                    </td>
                                    <td class="px-6 py-4 text-sm text-gray-900">
                                        {{-- {{ $billing->description }} --}}
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                        ₱{{ number_format($billing->amount, 2) }}
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                        <tfoot class="bg-gray-50">
                            <tr>
                                <td colspan="2" class="px-6 py-4 text-sm font-bold text-gray-900">
                                    Total Amount
                                </td>
                                <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                    ₱{{ number_format($total, 2) }}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            @else
                <div class="text-center py-8">
                    <p class="text-gray-500 italic">No charges found</p>
                </div>
            @endif
        </div>

        <!-- Rate Us Section -->
        <div class="text-center py-8">
            <div class="inline-flex items-center space-x-2">
                <span class="text-gray-600">Was this helpful?</span>
                {{-- {{ route('feedback.create', ['admission_id' => $admission->id]) }} --}}
                <a href="#" 
                   class="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors duration-200">
                    <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    Rate your experience
                </a>
            </div>
            <p class="mt-2 text-sm text-gray-500">Your feedback helps us improve our service</p>
        </div>
    </div>
</body>
</html>