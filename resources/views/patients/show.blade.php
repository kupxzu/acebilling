<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Patient Details</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Patient Information</h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal and admission details.</p>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl class="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Full name</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $patient->name }}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Room number</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $patient->room_number }}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Ward type</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ ucfirst($patient->ward_type) }}</dd>
                    </div>
                    <div class="sm:col-span-1">
                        <dt class="text-sm font-medium text-gray-500">Attending physician</dt>
                        <dd class="mt-1 text-sm text-gray-900">{{ $patient->attending_physician }}</dd>
                    </div>
                    <div class="sm:col-span-2">
                        <dt class="text-sm font-medium text-gray-500">Admission Status</dt>
                        <dd class="mt-1 text-sm text-gray-900">
                            <span class="px-2 py-1 text-xs font-semibold rounded-full
                                {{ $patient->admissions->first()?->status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }}">
                                {{ ucfirst($patient->admissions->first()?->status ?? 'Unknown') }}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>

        @if($patient->admissions->first()?->status === 'active')
        <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- Statement of Account -->
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Statement of Account</h3>
                    <div class="mt-4">
                        <a href="{{ route('billing.soa.download', $patient->id) }}" 
                           class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            Download SOA
                        </a>
                    </div>
                </div>
            </div>

            <!-- Progress Bill -->
            <div class="bg-white shadow overflow-hidden sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg leading-6 font-medium text-gray-900">Progress Bill</h3>
                    <div class="mt-4">
                        <a href="{{ route('billing.progress', ['id' => $patient->id]) }}" 
                           class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            View Progress Bill
                        </a>
                    </div>
                </div>
            </div>
        </div>
        @endif
    </div>
</body>
</html>