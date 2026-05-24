<?php

namespace App\Http\Controllers;

use App\Models\Recognition;
use App\Services\AIService;
use Illuminate\Http\Request;

class RecognitionController extends Controller
{
    public function index()
    {
        $recs = Recognition::with(['teacher', 'plan'])->orderBy('id', 'desc')->get();
        return response()->json(['success' => true, 'recognitions' => $recs]);
    }

    public function draft(Request $request)
    {
        try {
            $ai = new AIService();
            $draft = $ai->generateRecognitionDraft($request->all());
            return response()->json(['success' => true, 'draft' => $draft]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    public function publish(Request $request)
    {
        try {
            $recognition = Recognition::create([
                'title' => $request->title,
                'description' => $request->description,
                'teacher_id' => $request->teacher_id,
                'period_id' => $request->period_id,
                'plan_id' => $request->plan_id,
                'published_by' => $request->user()->id,
                'ai_generated' => $request->ai_generated ?? true,
                'published' => true,
                'published_at' => now(),
            ]);
            return response()->json(['success' => true, 'recognition' => $recognition]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }
}
