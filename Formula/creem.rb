# typed: false
# frozen_string_literal: true

class Creem < Formula
  desc "Command-line interface for Creem"
  homepage "https://creem.io"
  url "https://registry.npmjs.org/@creem_io/cli/-/cli-0.8.0.tgz"
  sha256 "749e3ccbe6c3075f7243b65b0b124489e88e2f38ae431d15cf4c60633cb63b75"
  license "MIT"

  depends_on "node@22"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    assert_equal version.to_s, shell_output("#{bin}/creem --version").strip
    assert_match "Usage:", shell_output("#{bin}/creem --help")

    # Exercise the installed CLI and SDK without real credentials or API traffic.
    # Regression: the old serverIdx option sent test keys to production (#164).
    (testpath/"mock-fetch.cjs").write <<~JS
      let requests = 0;
      globalThis.fetch = async (input) => {
        const url = new URL(input instanceof Request ? input.url : input);
        if (url.origin !== "https://test-api.creem.io" || url.pathname !== "/v1/products/search") {
          throw new Error(`Unexpected API destination: ${url}`);
        }
        requests++;
        return Response.json({
          items: [],
          pagination: { total_records: 0, total_pages: 0, current_page: 1, next_page: 0, prev_page: 0 }
        });
      };
      process.on("exit", () => { if (requests !== 1) process.exitCode = 1; });
    JS
    ENV["CREEM_API_KEY"] = "creem_test_homebrew_fixture"
    ENV["NODE_OPTIONS"] = "--require=#{testpath}/mock-fetch.cjs"
    output = shell_output("#{bin}/creem products list --json")
    assert_equal [], JSON.parse(output).fetch("items")
  end
end
