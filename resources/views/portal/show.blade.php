<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Progress Bill - {{ $patient->name }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        
        /* Print styles */
        @media print {
            .no-print { display: none !important; }
            @page { margin: 20mm; }
            body { print-color-adjust: exact; }
        }
        
        /* Custom animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
            animation: fadeIn 0.5s ease-out;
        }
        
        /* Gradient backgrounds */
        .gradient-to-br {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .subtle-gradient {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Enhanced Navbar -->
    <nav class="bg-white shadow-lg sticky top-0 z-50 no-print">
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center h-20">
                <!-- Logo Section -->
                <div class="flex items-center space-x-4">
                    <img class="block h-20 w-auto" src="{{ asset('your-logo.png') }}" alt="Hospital Logo">

                    <div>
                        <h1 class="text-xl font-bold text-gray-900">ACEMCT</h1>
                        <p class="text-xs text-gray-500">ACE Medical Center Tuguegarao</p>
                    </div>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center space-x-4">
                    <span class="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Active Patient
                    </span>
                    <button class="md:hidden p-2 rounded-lg hover:bg-gray-100">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-8 max-w-6xl">
        <!-- Header Section -->
        <div class="mb-8 text-center animate-fadeIn">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">Progress Bill</h1>
            <p class="text-lg text-gray-600">Patient Billing Statement</p>
        </div>
        
        <!-- Patient Information Card -->
        <div class="bg-white shadow-xl rounded-2xl overflow-hidden mb-8 animate-fadeIn">
            <!-- Card Header -->
            <div class="gradient-to-br p-6 text-white">
                <div class="flex items-center space-x-3">
                    <div class="p-3 bg-white/20 rounded-xl backdrop-blur">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold">
                            @if($patient->name)
                                {{ $patient->name }}
                            @else
                                {{ $patient->last_name ?? '' }}{{ $patient->first_name ? ', ' . $patient->first_name : '' }}{{ $patient->middle_name ? ' ' . $patient->middle_name : '' }}
                            @endif
                        </h2>
                        <p class="text-white/80">Patient ID: {{ $patient->id }}</p>
                    </div>
                </div>
            </div>

            <!-- Card Body -->
            <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Personal Information -->
                    <div class="space-y-4">
                        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Personal Info</h3>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Date of Birth</p>
                                    <p class="font-medium text-gray-900">{{ date('M d, Y', strtotime($patient->date_of_birth)) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Room Information -->
                    <div class="space-y-4">
                        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Room Details</h3>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Room Number</p>
                                    <p class="font-medium text-gray-900">{{ $patient->room_number ?? $admission->room_number ?? 'N/A' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Ward Type</p>
                                    <p class="font-medium text-gray-900 capitalize">{{ $patient->ward_type ?? $admission->ward_type ?? 'N/A' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Medical Information -->
                    <div class="space-y-4">
                        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Medical Info</h3>
                        <div class="space-y-3">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Attending Physician</p>
                                    <p class="font-medium text-gray-900">{{ $patient->attending_physician ?? $admission->attending_physician ?? 'N/A' }}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p class="text-xs text-gray-500">Admission Date</p>
                                    <p class="font-medium text-gray-900">{{ date('M d, Y', strtotime($patient->admission_date ?? $admission->admission_date ?? $admission->created_at)) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Bill Summary -->
        <div class="bg-white shadow-xl rounded-2xl overflow-hidden mb-8 animate-fadeIn">
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b">
                <div class="flex justify-between items-center">
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">Bill Preview</h2>
                        <p class="text-sm text-gray-600">Generated on {{ now()->format('F d, Y h:i A') }}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm text-gray-600">Total Bill</p>
                        <p class="text-3xl font-bold text-gray-900">₱{{ number_format($total ?? 0, 2) }}</p>
                    </div>
                </div>
            </div>

            <div class="p-6">
                @if($billings->count() > 0)
                    <div class="w-full h-[800px] border border-gray-200 rounded-lg overflow-hidden">
                        @php
                            $pdfFound = false;
                            $pdfUrl = '';
                            $currentBilling = null;
                            
                            foreach($billings as $billing) {
                                if ($billing->pdf_path && Storage::disk('public')->exists($billing->pdf_path)) {
                                    $pdfFound = true;
                                    $currentBilling = $billing;
                                    $pdfUrl = route('billing.pdf.show', $billing->id);
                                    break;
                                }
                            }
                        @endphp

                        @if($pdfFound)
                            <div class="relative w-full h-full">
                                <object 
                                    data="{{ $pdfUrl }}"
                                    type="application/pdf"
                                    width="100%"
                                    height="100%"
                                    class="w-full h-full"
                                    onerror="this.style.display='none'; document.getElementById('pdfError').style.display='flex';"
                                >
                                    <div id="pdfError" 
                                         class="absolute inset-0 flex flex-col items-center justify-center bg-gray-50"
                                         style="display: none;">
                                        <div class="text-center p-8">
                                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            <h3 class="mt-2 text-sm font-medium text-gray-900">Unable to display PDF</h3>
                                            <p class="mt-1 text-sm text-gray-500">Try opening the file directly</p>
                                            <div class="mt-6 space-x-3">
                                                <a href="{{ $pdfUrl }}" 
                                                   target="_blank"
                                                   class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                                                    </svg>
                                                    Open in New Tab
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </object>
                            </div>
                        @else
                            <!-- No PDF Found Message -->
                            <div class="flex flex-col items-center justify-center h-full bg-gray-50">
                                <div class="text-center p-8">
                                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <h3 class="mt-2 text-sm font-medium text-gray-900">PDF Not Available</h3>
                                    <p class="mt-1 text-sm text-gray-500">The PDF file could not be found</p>
                                </div>
                            </div>
                        @endif
                    </div>
                @else
                    <div class="text-center py-12">
                        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                        </svg>
                        <p class="mt-4 text-gray-500">No bill available yet</p>
                    </div>
                @endif
            </div>
        </div>

        <!-- Rating Section -->
        <div class="text-center py-12 no-print animate-fadeIn">
            <div class="inline-flex flex-col items-center">
                <a href="{{ url('/rate/' . $patient->id) }}" 
                   class="text-blue-600 hover:text-blue-800 transition-colors duration-200 font-medium">
                    Rate your experience
                </a>
                <p class="text-sm text-gray-600 mt-2">Your feedback helps us improve our services</p>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-900 text-white py-8 mt-12 no-print">
        <div class="container mx-auto px-4 text-center">
            <p class="text-sm">&copy; {{ date('Y') }} ACE Medical Center Tuguegarao. All rights reserved.</p>
            <p class="text-xs text-gray-400 mt-2">This is a computer-generated document. No signature is required.</p>
        </div>
    </footer>
</body>
</html>