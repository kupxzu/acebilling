<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .patient-info {
            margin-bottom: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
        }
        .total {
            text-align: right;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Progress Bill</h1>
        <p>Date: {{ $date }}</p>
    </div>

    <div class="patient-info">
        <p><strong>Patient Name:</strong> {{ $patient->name }}</p>
        <p><strong>Room Number:</strong> {{ $admission->room_number }}</p>
        <p><strong>Admission Date:</strong> {{ $admission->created_at->format('Y-m-d') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            @foreach($charges as $charge)
            <tr>
                <td>{{ $charge->created_at->format('Y-m-d') }}</td>
                <td>{{ $charge->description }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $charge->category)) }}</td>
                <td>₱ {{ number_format($charge->amount, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3" class="total">Total:</td>
                <td>₱ {{ number_format($total, 2) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>