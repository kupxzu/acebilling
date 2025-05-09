<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Statement of Account</title>
    <style>
        body { font-family: Arial, sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .patient-info { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-weight: bold; }
        .summary { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Statement of Account</h1>
        <p>{{ date('F d, Y') }}</p>
    </div>

    <div class="patient-info">
        <h3>Patient Information</h3>
        <p>Name: {{ $patient->name }}</p>
        <p>Room: {{ $patient->room_number }}</p>
        <p>Admission Date: {{ $admission->created_at->format('M d, Y') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($charges as $charge)
            <tr>
                <td>{{ $charge->created_at->format('M d, Y') }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $charge->category)) }}</td>
                <td>{{ $charge->description }}</td>
                <td>₱ {{ number_format($charge->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="summary">
        <h3>Summary by Category</h3>
        @foreach($charges_by_category as $category => $amount)
        <p>{{ ucfirst(str_replace('_', ' ', $category)) }}: ₱ {{ number_format($amount, 2) }}</p>
        @endforeach
    </div>

    <div class="summary">
        <h3>Payment Summary</h3>
        <p>Total Charges: ₱ {{ number_format($summary['total'], 2) }}</p>
        <p>Total Paid: ₱ {{ number_format($summary['paid'], 2) }}</p>
        <p class="total">Balance Due: ₱ {{ number_format($summary['balance'], 2) }}</p>
    </div>
</body>
</html>