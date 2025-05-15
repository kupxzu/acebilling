<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF Preview - {{ $patient->name }}</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Navbar -->
    <nav class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-24">
                <!-- Logo Section -->
                <div class="flex-shrink-0 flex items-center">
                    <img class="block h-20 w-auto" src="{{ asset('your-logo.png') }}" alt="Hospital Logo">
                    <div class="ml-3">
                        <span class="block text-2xl font-bold text-gray-900 hidden md:block">ACEMCT</span>
                        <span class="block text-sm text-gray-500 hidden md:block">ACE MEDICAL CENTER TUGUEGARAO</span>
                    </div>
                </div>

                <!-- Navigation Links -->
                <div class="hidden md:flex md:items-center md:space-x-4">
                    <a href="javascript:history.back()" class="text-gray-600 hover:text-gray-900">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Patient Info Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">{{ $patient->name }}</h2>
                    <p class="text-gray-600">Room: {{ $admission->room_number }} | Ward Type: {{ $admission->ward_type }}</p>
                </div>
                <div class="text-right">
                    <p class="text-sm text-gray-500">Bill Date</p>
                    <p class="text-lg font-medium">{{ $billDate }}</p>
                </div>
            </div>
        </div>

        <!-- PDF Viewer -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            @if(isset($pdfUrl))
                <iframe 
                    src="{{ $pdfUrl }}"
                    class="w-full h-[800px]"
                    frameborder="0"
                    title="PDF Preview">
                </iframe>
            @else
                <div class="p-8 text-center">
                    <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="mt-4 text-gray-600">PDF file not available</p>
                </div>
            @endif
        </div>
    </div>
</body>
</html>