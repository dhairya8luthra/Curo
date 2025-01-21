import { useState, type ChangeEvent, type FormEvent } from 'react';
import { getAuth } from 'firebase/auth';

import Sidebar from '../components/ui/Layout/SideBar';
import { Card, CardContent, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, HeartPulse, Loader2, Info, Calculator, ArrowRight, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';

interface FormData {
  Age: string;
  Diabetes: boolean;
  BloodPressureProblems: boolean;
  AnyTransplants: boolean;
  AnyChronicDiseases: boolean;
  Height: string;
  Weight: string;
  KnownAllergies: boolean;
  HistoryOfCancerInFamily: boolean;
  NumberOfMajorSurgeries: string;
}

const initialFormData: FormData = {
  Age: '',
  Diabetes: false,
  BloodPressureProblems: false,
  AnyTransplants: false,
  AnyChronicDiseases: false,
  Height: '',
  Weight: '',
  KnownAllergies: false,
  HistoryOfCancerInFamily: false,
  NumberOfMajorSurgeries: '',
};

const formFields = [
  { label: 'Age', name: 'Age', type: 'number', placeholder: 'Enter your age', icon: null },
  { label: 'Do you have diabetes?', name: 'Diabetes', type: 'boolean', description: 'Including Type 1 and Type 2 diabetes' },
  { label: 'Blood Pressure Issues', name: 'BloodPressureProblems', type: 'boolean', description: 'Hypertension or hypotension' },
  { label: 'Previous Transplants', name: 'AnyTransplants', type: 'boolean', description: 'Any organ or tissue transplants' },
  { label: 'Chronic Diseases', name: 'AnyChronicDiseases', type: 'boolean', description: 'Long-term medical conditions' },
  { label: 'Height', name: 'Height', type: 'number', placeholder: 'Enter height in cm', unit: 'cm' },
  { label: 'Weight', name: 'Weight', type: 'number', placeholder: 'Enter weight in kg', unit: 'kg' },
  { label: 'Known Allergies', name: 'KnownAllergies', type: 'boolean', description: 'Any significant allergic conditions' },
  { label: 'Family Cancer History', name: 'HistoryOfCancerInFamily', type: 'boolean', description: 'Immediate family members' },
  { label: 'Major Surgeries', name: 'NumberOfMajorSurgeries', type: 'number', placeholder: 'Number of surgeries', icon: null },
];

export default function PremiumPredictor() {
  const [activeTab, setActiveTab] = useState("Insurance Premium Predictor");
  const [formProgress, setFormProgress] = useState(0);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateBMI = () => {
    if (formData.Height && formData.Weight) {
      const heightInMeters = Number(formData.Height) / 100;
      const weight = Number(formData.Weight);
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Calculate form completion progress
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values({ ...formData, [name]: value }).filter(v => 
      (typeof v === 'boolean') || (typeof v === 'string' && v.trim() !== '')
    ).length;
    setFormProgress((filledFields / totalFields) * 100);
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setPrediction(null);
    setError(null);
    setFormProgress(0);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setPrediction(null);

    const features: number[] = Object.entries(formData).map(([, value]) => {
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }
      return Number(value);
    });

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        setError('No logged-in user found.');
        setIsLoading(false);
        return;
      }
      const token = await user.getIdToken();

      const response = await fetch('http://localhost:3000/api/premium-predictor/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ features }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setPrediction(data.prediction);
      } else {
        setError(data.error || 'Failed to get prediction');
      }
    } catch (err) {
      setError('Failed to connect to the prediction service');
    } finally {
      setIsLoading(false);
    }
  };

  const bmi = calculateBMI();

  return (
    <div className="flex h-screen w-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-blue-50 to-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <HeartPulse className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Insurance Premium Calculator</h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Form
            </Button>
          </div>

          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="space-y-1">
              <CardDescription className="text-base">
                Complete the form below to get your estimated insurance premium
              </CardDescription>
              <div className="mt-2">
                <Progress value={formProgress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-1">
                  Form completion: {formProgress.toFixed(0)}%
                </p>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {formFields.map((field) => (
                    <div key={field.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor={field.name} className="text-sm font-medium">
                          {field.label}
                        </Label>
                        {field.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{field.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>

                      {field.type === 'boolean' ? (
                        <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded-md">
                          <Switch
                            id={field.name}
                            checked={formData[field.name as keyof FormData] as boolean}
                            onCheckedChange={(checked) => handleChange(field.name, checked)}
                          />
                          <Label htmlFor={field.name} className="text-sm">
                            {formData[field.name as keyof FormData] ? 'Yes' : 'No'}
                          </Label>
                        </div>
                      ) : (
                        <div className="relative">
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            placeholder={field.placeholder}
                            value={formData[field.name as keyof FormData] as string}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => 
                              handleChange(field.name, e.target.value)
                            }
                            required
                            className="w-full pr-12"
                            min="0"
                          />
                          {field.unit && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {bmi && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Your BMI</AlertTitle>
                    <AlertDescription>
                      Based on your height and weight, your BMI is: <strong>{bmi}</strong>
                    </AlertDescription>
                  </Alert>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Separator />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg"
                  disabled={isLoading || formProgress < 100}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Calculating Premium...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-5 w-5" />
                      Calculate Premium
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            {prediction !== null && (
              <CardFooter className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-b-lg border-t">
                <div className="w-full space-y-4 py-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-green-800">
                      Your Estimated Premium
                    </h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-green-600" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This prediction is calculated using a machine learning model trained on historical data. Actual premiums may vary based on additional factors.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    ₹{prediction.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    <span className="text-base font-normal text-green-600 ml-1">per year</span>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}