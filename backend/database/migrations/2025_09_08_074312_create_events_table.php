<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->cascadeOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            $table->string('venue_name')->nullable();
            $table->string('venue_address')->nullable();
            $table->decimal('location_lat', 10, 7)->nullable();
            $table->decimal('location_lng', 10, 7)->nullable();

            $table->dateTime('start_at');          // store UTC
            $table->dateTime('end_at')->nullable();

            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedInteger('price_yen')->default(0);
            $table->enum('visibility', ['public','private'])->default('public');

            $table->timestamps();

            $table->index('group_id');
            $table->index('created_by');
            $table->index('start_at');
            $table->index(['location_lat','location_lng']);
            $table->fullText(['title','description']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
